"use client";

import { useState, useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { UserRole } from "@/db/schema/enums";
import {
	Users,
	UserPlus,
	Ban,
	Unlock,
	Shield,
	Eye,
	EyeOff,
	Search,
	MoreHorizontal,
	Trash2,
	Edit,
	AlertTriangle,
	CheckCircle,
	XCircle,
	ArrowUpDown,
	ChevronUp,
	ChevronDown,
	Calendar as CalendarIcon,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

interface User {
	id: string;
	name: string;
	email: string;
	role?: string;
	banned?: boolean | null;
	banReason?: string | null;
	banExpires?: Date | null;
	createdAt: Date;
	lastLoginAt?: Date | null;
	image?: string | null;
	userName?: string;
}

interface Session {
	id: string;
	token: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	ipAddress?: string | null;
	userAgent?: string | null;
}

// Form validation schema for create user
const createUserSchema = z.object({
	name: z.string().min(2, "Name must contain at least 2 character(s)").max(25),
	email: z.string().email("Please enter a valid email address"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/^(?=.*[!@#$%^&*])/, {
			message:
				"Password must contain at least one special character (!@#$%^&*)",
		}),
	role: z.nativeEnum(UserRole),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

function formatDate(date: Date | undefined) {
	if (!date) {
		return "";
	}

	return date.toLocaleDateString("en-US", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

export default function AdminPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [totalUsers, setTotalUsers] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [showCreateUser, setShowCreateUser] = useState(false);
	const [showBanUser, setShowBanUser] = useState(false);
	const [showUnbanUser, setShowUnbanUser] = useState(false);
	const [showSessions, setShowSessions] = useState(false);
	const [userSessions, setUserSessions] = useState<Session[]>([]);

	// Confirmation dialog states
	const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);
	const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
	const [showUnbanUserDialog, setShowUnbanUserDialog] = useState(false);
	const [showBanDetailsDialog, setShowBanDetailsDialog] = useState(false);
	const [pendingAction, setPendingAction] = useState<{
		type: "role" | "delete" | "ban" | "unban";
		userId: string;
		role?: string;
	} | null>(null);

	// Sorting states
	const [userSortField, setUserSortField] = useState<keyof User>("createdAt");
	const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("desc");
	const [sessionSortField, setSessionSortField] =
		useState<keyof Session>("createdAt");
	const [sessionSortOrder, setSessionSortOrder] = useState<"asc" | "desc">(
		"desc",
	);

	// Form validation
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<CreateUserFormValues>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: UserRole.USER,
		},
	});

	const watchedRole = watch("role");
	const [banData, setBanData] = useState({
		reason: "",
		expiresIn: null as Date | null,
	});
	const [banDateOpen, setBanDateOpen] = useState(false);
	const [banDateValue, setBanDateValue] = useState("");
	const [banDateMonth, setBanDateMonth] = useState<Date | undefined>(undefined);

	useEffect(() => {
		loadUsers();
	}, [currentPage, searchQuery]);

	const loadUsers = async () => {
		setLoading(true);
		try {
			const offset = (currentPage - 1) * pageSize;
			const response = await authClient.admin.listUsers({
				query: {
					limit: pageSize,
					offset,
					...(searchQuery && {
						searchField: "email",
						searchOperator: "contains",
						searchValue: searchQuery,
					}),
					sortBy: "createdAt",
					sortDirection: "desc",
				},
			});

			// Handle the response data structure
			if ("data" in response && response.data) {
				setUsers(response.data.users || []);
				setTotalUsers(response.data.total || 0);
			} else {
				setUsers([]);
				setTotalUsers(0);
			}
		} catch (error) {
			console.error("Failed to load users:", error);
			toast.error("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateUser = async (data: CreateUserFormValues) => {
		try {
			await authClient.admin.createUser({
				name: data.name,
				email: data.email,
				password: data.password,
				role: data.role,
			});
			toast.success("User created successfully");
			setShowCreateUser(false);
			reset();
			loadUsers();
		} catch (error) {
			console.error("Failed to create user:", error);
			toast.error("Failed to create user");
		}
	};

	const handleBanUser = async () => {
		if (!selectedUser) return;
		try {
			await authClient.admin.banUser({
				userId: selectedUser.id,
				banReason: banData.reason || undefined,
				banExpiresIn: banData.expiresIn
					? Math.floor(
							(banData.expiresIn.getTime() - new Date().getTime()) / 1000,
						)
					: undefined,
			});
			toast.success("User banned successfully");
			setShowBanUser(false);
			setBanData({ reason: "", expiresIn: null });
			loadUsers();
		} catch (error) {
			console.error("Failed to ban user:", error);
			toast.error("Failed to ban user");
		}
	};

	const handleUnbanUser = async () => {
		if (!selectedUser) return;
		setPendingAction({ type: "unban", userId: selectedUser.id });
		setShowUnbanUserDialog(true);
	};

	const confirmUnbanUser = async () => {
		if (!pendingAction || pendingAction.type !== "unban" || !selectedUser)
			return;

		try {
			await authClient.admin.unbanUser({
				userId: selectedUser.id,
			});
			toast.success("User unbanned successfully");
			setShowUnbanUser(false);
			setShowUnbanUserDialog(false);
			loadUsers();
		} catch (error) {
			console.error("Failed to unban user:", error);
			toast.error("Failed to unban user");
		} finally {
			setPendingAction(null);
		}
	};

	const handleSetRole = async (userId: string, role: string) => {
		setPendingAction({ type: "role", userId, role });
		setShowRoleChangeDialog(true);
	};

	const confirmSetRole = async () => {
		if (!pendingAction || pendingAction.type !== "role") return;

		try {
			await authClient.admin.setRole({
				userId: pendingAction.userId,
				role: pendingAction.role as UserRole,
			});
			toast.success("User role updated successfully");
			loadUsers();
		} catch (error) {
			console.error("Failed to update user role:", error);
			toast.error("Failed to update user role");
		} finally {
			setShowRoleChangeDialog(false);
			setPendingAction(null);
		}
	};

	const handleDeleteUser = async (userId: string) => {
		setPendingAction({ type: "delete", userId });
		setShowDeleteUserDialog(true);
	};

	const confirmDeleteUser = async () => {
		if (!pendingAction || pendingAction.type !== "delete") return;

		try {
			await authClient.admin.removeUser({
				userId: pendingAction.userId,
			});
			toast.success("User deleted successfully");
			loadUsers();
		} catch (error) {
			console.error("Failed to delete user:", error);
			toast.error("Failed to delete user");
		} finally {
			setShowDeleteUserDialog(false);
			setPendingAction(null);
		}
	};

	const handleImpersonateUser = async (userId: string) => {
		try {
			await authClient.admin.impersonateUser({
				userId,
			});
			toast.success("Impersonation started");
			window.location.href = "/";
		} catch (error) {
			console.error("Failed to impersonate user:", error);
			toast.error("Failed to impersonate user");
		}
	};

	const handleLoadSessions = async (userId: string) => {
		try {
			const response = await authClient.admin.listUserSessions({
				userId,
			});

			// Handle the response data structure
			if ("data" in response && response.data) {
				setUserSessions(response.data.sessions || []);
			} else {
				setUserSessions([]);
			}
			setShowSessions(true);
		} catch (error) {
			console.error("Failed to load sessions:", error);
			toast.error("Failed to load sessions");
		}
	};

	const handleRevokeSession = async (sessionToken: string) => {
		try {
			await authClient.admin.revokeUserSession({
				sessionToken,
			});
			toast.success("Session revoked successfully");
			handleLoadSessions(selectedUser!.id);
		} catch (error) {
			console.error("Failed to revoke session:", error);
			toast.error("Failed to revoke session");
		}
	};

	const handleRevokeAllSessions = async (userId: string) => {
		try {
			await authClient.admin.revokeUserSessions({
				userId,
			});
			toast.success("All sessions revoked successfully");
			handleLoadSessions(userId);
		} catch (error) {
			console.error("Failed to revoke all sessions:", error);
			toast.error("Failed to revoke all sessions");
		}
	};

	const totalPages = Math.ceil(totalUsers / pageSize);

	return (
		<div className="space-y-6 max-w-screen lg:w-[60vw]">
			<div>
				<h3 className="text-lg font-medium">Admin Panel</h3>
				<p className="text-sm text-muted-foreground">
					Manage users, roles, and permissions
				</p>
			</div>

			<Tabs defaultValue="users" className="space-y-4">
				<TabsList>
					<TabsTrigger value="users">Users</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="users" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>User Management</CardTitle>
									<CardDescription>
										Manage user accounts, roles, and permissions
									</CardDescription>
								</div>
								<Button onClick={() => setShowCreateUser(true)}>
									<UserPlus className="mr-2 h-4 w-4" />
									Create User
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="flex items-center space-x-2 mb-4">
								<div className="relative flex-1">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search users by email..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-8"
									/>
								</div>
							</div>

							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead
												className="cursor-pointer"
												onClick={() => {
													setUserSortField("name");
													setUserSortOrder(
														userSortOrder === "asc" ? "desc" : "asc",
													);
												}}
											>
												<div className="flex items-center">
													User
													{userSortField === "name" ? (
														<SortIcon order={userSortOrder} />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</div>
											</TableHead>
											<TableHead
												className="cursor-pointer"
												onClick={() => {
													setUserSortField("email");
													setUserSortOrder(
														userSortOrder === "asc" ? "desc" : "asc",
													);
												}}
											>
												<div className="flex items-center">
													Email
													{userSortField === "email" ? (
														<SortIcon order={userSortOrder} />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</div>
											</TableHead>
											<TableHead
												className="cursor-pointer"
												onClick={() => {
													setUserSortField("role");
													setUserSortOrder(
														userSortOrder === "asc" ? "desc" : "asc",
													);
												}}
											>
												<div className="flex items-center">
													Role
													{userSortField === "role" ? (
														<SortIcon order={userSortOrder} />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</div>
											</TableHead>
											<TableHead
												className="cursor-pointer"
												onClick={() => {
													setUserSortField("banned");
													setUserSortOrder(
														userSortOrder === "asc" ? "desc" : "asc",
													);
												}}
											>
												<div className="flex items-center">
													Status
													{userSortField === "banned" ? (
														<SortIcon order={userSortOrder} />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</div>
											</TableHead>
											<TableHead
												className="cursor-pointer"
												onClick={() => {
													setUserSortField("createdAt");
													setUserSortOrder(
														userSortOrder === "asc" ? "desc" : "asc",
													);
												}}
											>
												<div className="flex items-center">
													Created
													{userSortField === "createdAt" ? (
														<SortIcon order={userSortOrder} />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</div>
											</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{loading ? (
											<TableRow>
												<TableCell colSpan={6} className="text-center">
													Loading...
												</TableCell>
											</TableRow>
										) : users.length === 0 ? (
											<TableRow>
												<TableCell colSpan={6} className="text-center">
													No users found
												</TableCell>
											</TableRow>
										) : (
											users
												.sort((a, b) => {
													const modifier = userSortOrder === "asc" ? 1 : -1;
													const aVal = a[userSortField];
													const bVal = b[userSortField];

													// Handle null/undefined values
													if (aVal == null && bVal == null) return 0;
													if (aVal == null) return 1 * modifier;
													if (bVal == null) return -1 * modifier;

													if (aVal < bVal) return -1 * modifier;
													if (aVal > bVal) return 1 * modifier;
													return 0;
												})
												.map((user) => (
													<TableRow key={user.id}>
														<TableCell>
															<div className="flex items-center space-x-2">
																<Avatar className="h-8 w-8">
																	<AvatarImage src={user.image || undefined} />
																	<AvatarFallback>
																		{user.name?.charAt(0).toUpperCase()}
																	</AvatarFallback>
																</Avatar>
																<div>
																	<div className="font-medium">{user.name}</div>
																	<div className="text-sm text-muted-foreground">
																		{user.userName || ""}
																	</div>
																</div>
															</div>
														</TableCell>
														<TableCell>{user.email}</TableCell>
														<TableCell>
															<Select
																value={user.role || UserRole.USER}
																onValueChange={(value) =>
																	handleSetRole(user.id, value)
																}
															>
																<SelectTrigger className="w-24">
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value={UserRole.USER}>
																		User
																	</SelectItem>
																	<SelectItem value={UserRole.ADMIN}>
																		Admin
																	</SelectItem>
																</SelectContent>
															</Select>
														</TableCell>
														<TableCell>
															{user.banned === true ? (
																<TooltipProvider>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<Badge
																				variant="destructive"
																				className="cursor-pointer hover:bg-red-700"
																				onClick={() => {
																					setSelectedUser(user);
																					setShowBanDetailsDialog(true);
																				}}
																			>
																				<Ban className="mr-1 h-3 w-3" />
																				Banned
																			</Badge>
																		</TooltipTrigger>
																		<TooltipContent>
																			<p>Click to view ban details</p>
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															) : (
																<Badge variant="default">
																	<CheckCircle className="mr-1 h-3 w-3" />
																	Active
																</Badge>
															)}
														</TableCell>
														<TableCell>
															{new Date(user.createdAt).toLocaleDateString()}
														</TableCell>
														<TableCell className="text-right">
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button
																		variant="ghost"
																		className="h-8 w-8 p-0"
																	>
																		<MoreHorizontal className="h-4 w-4" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	<DropdownMenuItem
																		onClick={() => {
																			setSelectedUser(user);
																			handleLoadSessions(user.id);
																		}}
																	>
																		<Eye className="mr-2 h-4 w-4" />
																		View Sessions
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		onClick={() =>
																			handleImpersonateUser(user.id)
																		}
																	>
																		<UserPlus className="mr-2 h-4 w-4" />
																		Impersonate
																	</DropdownMenuItem>
																	{user.banned === true ? (
																		<DropdownMenuItem
																			onClick={() => {
																				setSelectedUser(user);
																				handleUnbanUser();
																			}}
																		>
																			<Unlock className="mr-2 h-4 w-4" />
																			Unban User
																		</DropdownMenuItem>
																	) : (
																		<DropdownMenuItem
																			onClick={() => {
																				setSelectedUser(user);
																				setShowBanUser(true);
																			}}
																		>
																			<Ban className="mr-2 h-4 w-4" />
																			Ban User
																		</DropdownMenuItem>
																	)}
																	<DropdownMenuItem
																		onClick={() => handleDeleteUser(user.id)}
																		className="text-destructive"
																	>
																		<Trash2 className="mr-2 h-4 w-4" />
																		Delete User
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</TableCell>
													</TableRow>
												))
										)}
									</TableBody>
								</Table>
							</div>

							{totalPages > 1 && (
								<Pagination className="mt-4">
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												onClick={() =>
													setCurrentPage(Math.max(1, currentPage - 1))
												}
												className={
													currentPage === 1
														? "pointer-events-none opacity-50"
														: ""
												}
											/>
										</PaginationItem>
										{Array.from({ length: totalPages }, (_, i) => i + 1).map(
											(page) => (
												<PaginationItem key={page}>
													<PaginationLink
														onClick={() => setCurrentPage(page)}
														isActive={currentPage === page}
													>
														{page}
													</PaginationLink>
												</PaginationItem>
											),
										)}
										<PaginationItem>
											<PaginationNext
												onClick={() =>
													setCurrentPage(Math.min(totalPages, currentPage + 1))
												}
												className={
													currentPage === totalPages
														? "pointer-events-none opacity-50"
														: ""
												}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Analytics</CardTitle>
							<CardDescription>User statistics and insights</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Total Users
										</CardTitle>
										<Users className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{totalUsers}</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Active Users
										</CardTitle>
										<CheckCircle className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{users.filter((u) => u.banned !== true).length}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Banned Users
										</CardTitle>
										<Ban className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{users.filter((u) => u.banned === true).length}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Admins
										</CardTitle>
										<Shield className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{users.filter((u) => u.role === UserRole.ADMIN).length}
										</div>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Create User Dialog */}
			<Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New User</DialogTitle>
						<DialogDescription>
							Create a new user account with the specified role.
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={handleSubmit(handleCreateUser)}
						className="grid gap-4 py-4"
					>
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								{...register("name")}
								className={errors.name ? "border-red-500" : ""}
								placeholder="Enter user's name"
							/>
							{errors.name && (
								<p className="text-sm text-red-500 dark:text-red-900">
									{errors.name.message}
								</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								{...register("email")}
								className={errors.email ? "border-red-500" : ""}
								placeholder="Enter user's email"
							/>
							{errors.email && (
								<p className="text-sm text-red-500 dark:text-red-900">
									{errors.email.message}
								</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								{...register("password")}
								className={errors.password ? "border-red-500" : ""}
								placeholder="Enter password"
							/>
							{errors.password && (
								<p className="text-sm text-red-500 dark:text-red-900">
									{errors.password.message}
								</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="role">Role</Label>
							<Select
								value={watchedRole}
								onValueChange={(value) => setValue("role", value as UserRole)}
							>
								<SelectTrigger className={errors.role ? "border-red-500" : ""}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={UserRole.USER}>User</SelectItem>
									<SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
								</SelectContent>
							</Select>
							{errors.role && (
								<p className="text-sm text-red-500 dark:text-red-900">
									{errors.role.message}
								</p>
							)}
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setShowCreateUser(false);
									reset();
								}}
							>
								Cancel
							</Button>
							<Button type="submit">Create User</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Ban User Dialog */}
			<Dialog open={showBanUser} onOpenChange={setShowBanUser}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ban User</DialogTitle>
						<DialogDescription>
							Ban {selectedUser?.name} from the platform.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="banReason">Reason (Optional)</Label>
							<Textarea
								id="banReason"
								placeholder="Enter ban reason..."
								value={banData.reason}
								onChange={(e) =>
									setBanData({ ...banData, reason: e.target.value })
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="banExpires">Ban Expiration (Optional)</Label>
							<div className="relative flex gap-2">
								<Input
									id="banExpires"
									value={banDateValue}
									placeholder="Tomorrow, next week, or pick a date"
									className="bg-background pr-10"
									onChange={(e) => {
										setBanDateValue(e.target.value);
										// Simple date parsing for common phrases
										const text = e.target.value.toLowerCase();
										let date: Date | null = null;

										if (text.includes("tomorrow")) {
											date = new Date();
											date.setDate(date.getDate() + 1);
										} else if (text.includes("next week")) {
											date = new Date();
											date.setDate(date.getDate() + 7);
										} else if (text.includes("in 2 days")) {
											date = new Date();
											date.setDate(date.getDate() + 2);
										} else if (text.includes("in 3 days")) {
											date = new Date();
											date.setDate(date.getDate() + 3);
										} else if (text.includes("in 1 week")) {
											date = new Date();
											date.setDate(date.getDate() + 7);
										} else if (text.includes("in 2 weeks")) {
											date = new Date();
											date.setDate(date.getDate() + 14);
										} else if (text.includes("in 1 month")) {
											date = new Date();
											date.setMonth(date.getMonth() + 1);
										}

										if (date) {
											setBanData({ ...banData, expiresIn: date });
											setBanDateValue(formatDate(date));
										}
									}}
									onKeyDown={(e) => {
										if (e.key === "ArrowDown") {
											e.preventDefault();
											setBanDateOpen(true);
										}
									}}
								/>
								<Popover open={banDateOpen} onOpenChange={setBanDateOpen}>
									<PopoverTrigger asChild>
										<Button
											id="date-picker"
											variant="ghost"
											className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
										>
											<CalendarIcon className="size-3.5" />
											<span className="sr-only">Select date</span>
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto overflow-hidden p-0"
										align="end"
									>
										<Calendar
											mode="single"
											selected={banData.expiresIn || undefined}
											captionLayout="dropdown"
											month={banDateMonth}
											onMonthChange={setBanDateMonth}
											onSelect={(date) => {
												setBanData({ ...banData, expiresIn: date || null });
												setBanDateValue(formatDate(date));
												setBanDateOpen(false);
											}}
											disabled={(date) => date < new Date()}
										/>
									</PopoverContent>
								</Popover>
							</div>
							{banData.expiresIn && (
								<div className="text-muted-foreground px-1 text-sm">
									User will be banned until{" "}
									<span className="font-medium">
										{formatDate(banData.expiresIn)}
									</span>
									.
								</div>
							)}
							{banData.expiresIn && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setBanData({ ...banData, expiresIn: null });
										setBanDateValue("");
									}}
									className="text-red-600 hover:text-red-700"
								>
									Clear date (permanent ban)
								</Button>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowBanUser(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleBanUser}>
							Ban User
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Unban User Dialog */}
			<Dialog open={showUnbanUser} onOpenChange={setShowUnbanUser}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Unban User</DialogTitle>
						<DialogDescription>
							Unban {selectedUser?.name} from the platform.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<p>Are you sure you want to unban this user?</p>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowUnbanUser(false)}>
							Cancel
						</Button>
						<Button onClick={handleUnbanUser}>Continue to Unban</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* User Sessions Dialog */}
			<Dialog open={showSessions} onOpenChange={setShowSessions}>
				<DialogContent className=" min-w-fit">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Eye className="h-5 w-5" />
							User Sessions
						</DialogTitle>
						<DialogDescription>
							Active sessions for{" "}
							<span className="font-semibold">{selectedUser?.name}</span>
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{/* Session Summary */}
						<div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
							<div className="flex items-center gap-4">
								<div className="flex items-center gap-2">
									<Badge variant="secondary" className="text-sm">
										{userSessions.length}{" "}
										{userSessions.length === 1 ? "Session" : "Sessions"}
									</Badge>
								</div>
								<div className="text-sm text-muted-foreground">
									Last updated: {new Date().toLocaleTimeString()}
								</div>
							</div>
							<Button
								variant="destructive"
								size="sm"
								onClick={() =>
									selectedUser && handleRevokeAllSessions(selectedUser.id)
								}
								disabled={userSessions.length === 0}
							>
								<XCircle className="mr-2 h-4 w-4" />
								Revoke All Sessions
							</Button>
						</div>

						{/* Sessions Table */}
						<div className="border rounded-lg overflow-hidden max-h-[50vh]">
							<div className="overflow-x-auto overflow-y-auto max-h-[50vh]">
								<Table>
									<TableHeader className="sticky top-0 bg-background z-10">
										<TableRow className="bg-muted/50">
											<TableHead
												className="cursor-pointer hover:bg-muted/70 transition-colors"
												onClick={() => {
													setSessionSortField("id");
													setSessionSortOrder(
														sessionSortOrder === "asc" ? "desc" : "asc",
													);
												}}
											>
												<div className="flex items-center">
													Session ID
													{sessionSortField === "id" ? (
														<SortIcon order={sessionSortOrder} />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</div>
											</TableHead>
											<TableHead>IP Address</TableHead>
											<TableHead>User Agent</TableHead>
											<TableHead
												className="cursor-pointer hover:bg-muted/70 transition-colors"
												onClick={() => {
													setSessionSortField("createdAt");
													setSessionSortOrder(
														sessionSortOrder === "asc" ? "desc" : "asc",
													);
												}}
											>
												<div className="flex items-center">
													Created
													{sessionSortField === "createdAt" ? (
														<SortIcon order={sessionSortOrder} />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</div>
											</TableHead>
											<TableHead
												className="cursor-pointer hover:bg-muted/70 transition-colors"
												onClick={() => {
													setSessionSortField("expiresAt");
													setSessionSortOrder(
														sessionSortOrder === "asc" ? "desc" : "asc",
													);
												}}
											>
												<div className="flex items-center">
													Expires
													{sessionSortField === "expiresAt" ? (
														<SortIcon order={sessionSortOrder} />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</div>
											</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{userSessions.length === 0 ? (
											<TableRow>
												<TableCell colSpan={6} className="text-center py-8">
													<div className="flex flex-col items-center gap-2 text-muted-foreground">
														<EyeOff className="h-8 w-8" />
														<p className="text-sm">No active sessions found</p>
														<p className="text-xs">
															This user has no active sessions
														</p>
													</div>
												</TableCell>
											</TableRow>
										) : (
											userSessions
												.sort((a, b) => {
													const modifier = sessionSortOrder === "asc" ? 1 : -1;
													const aVal = a[sessionSortField];
													const bVal = b[sessionSortField];

													// Handle null/undefined values
													if (aVal == null && bVal == null) return 0;
													if (aVal == null) return 1 * modifier;
													if (bVal == null) return -1 * modifier;

													if (aVal < bVal) return -1 * modifier;
													if (aVal > bVal) return 1 * modifier;
													return 0;
												})
												.map((session, index) => (
													<TableRow
														key={session.id}
														className={
															index % 2 === 0 ? "bg-background" : "bg-muted/30"
														}
													>
														<TableCell className="font-mono text-sm">
															<Badge variant="outline" className="text-xs">
																{session.id.slice(0, 8)}...
															</Badge>
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																<span className="text-sm">
																	{session.ipAddress || "Unknown"}
																</span>
																{session.ipAddress && (
																	<Badge
																		variant="secondary"
																		className="text-xs"
																	>
																		{session.ipAddress.includes("127.0.0.1")
																			? "Local"
																			: "Remote"}
																	</Badge>
																)}
															</div>
														</TableCell>
														<TableCell className="max-w-xs">
															<div
																className="truncate text-sm"
																title={session.userAgent || "Unknown"}
															>
																{session.userAgent || "Unknown"}
															</div>
														</TableCell>
														<TableCell>
															<div className="text-sm">
																{new Date(
																	session.createdAt,
																).toLocaleDateString()}
																<br />
																<span className="text-xs text-muted-foreground">
																	{new Date(
																		session.createdAt,
																	).toLocaleTimeString()}
																</span>
															</div>
														</TableCell>
														<TableCell>
															<div className="text-sm">
																{new Date(
																	session.expiresAt,
																).toLocaleDateString()}
																<br />
																<span className="text-xs text-muted-foreground">
																	{new Date(
																		session.expiresAt,
																	).toLocaleTimeString()}
																</span>
															</div>
														</TableCell>
														<TableCell className="text-right">
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	handleRevokeSession(session.token)
																}
																className="text-red-600 hover:text-red-700 hover:bg-red-50"
																title="Revoke this session"
															>
																<XCircle className="h-4 w-4" />
															</Button>
														</TableCell>
													</TableRow>
												))
										)}
									</TableBody>
								</Table>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Role Change Confirmation Dialog */}
			<AlertDialog
				open={showRoleChangeDialog}
				onOpenChange={setShowRoleChangeDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Change User Role</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to change the role of this user to{" "}
							<span className="font-semibold">
								{pendingAction?.role === UserRole.ADMIN ? "Admin" : "User"}
							</span>
							? This action will grant or revoke administrative privileges.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmSetRole}
							className="bg-blue-600 hover:bg-blue-700"
						>
							Confirm Role Change
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete User Confirmation Dialog */}
			<AlertDialog
				open={showDeleteUserDialog}
				onOpenChange={setShowDeleteUserDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this user? This action cannot be
							undone and will permanently remove the user account and all
							associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDeleteUser}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete User
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Unban User Confirmation Dialog */}
			<AlertDialog
				open={showUnbanUserDialog}
				onOpenChange={setShowUnbanUserDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unban User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to unban {selectedUser?.name}? This will
							restore their access to the platform.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmUnbanUser}
							className="bg-green-600 hover:bg-green-700"
						>
							Unban User
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Ban Details Dialog */}
			<Dialog
				open={showBanDetailsDialog}
				onOpenChange={setShowBanDetailsDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ban Details</DialogTitle>
						<DialogDescription>
							Ban information for {selectedUser?.name}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label className="text-sm font-medium">Ban Reason</Label>
							<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
								{selectedUser?.banReason ? (
									<p className="text-sm">{selectedUser.banReason}</p>
								) : (
									<p className="text-sm text-muted-foreground italic">
										No reason provided
									</p>
								)}
							</div>
						</div>
						<div className="grid gap-2">
							<Label className="text-sm font-medium">Ban Expiration</Label>
							<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
								{selectedUser?.banExpires ? (
									<p className="text-sm">
										{new Date(selectedUser.banExpires).toLocaleDateString()} at{" "}
										{new Date(selectedUser.banExpires).toLocaleTimeString()}
									</p>
								) : (
									<p className="text-sm text-muted-foreground italic">
										Permanent ban
									</p>
								)}
							</div>
						</div>
						<div className="grid gap-2">
							<Label className="text-sm font-medium">Ban Status</Label>
							<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
								{selectedUser?.banExpires &&
								new Date(selectedUser.banExpires) > new Date() ? (
									<p className="text-sm text-orange-600 dark:text-orange-400">
										<Ban className="inline mr-1 h-3 w-3" />
										Currently banned
									</p>
								) : selectedUser?.banExpires ? (
									<p className="text-sm text-green-600 dark:text-green-400">
										<CheckCircle className="inline mr-1 h-3 w-3" />
										Ban expired
									</p>
								) : (
									<p className="text-sm text-red-600 dark:text-red-400">
										<Ban className="inline mr-1 h-3 w-3" />
										Permanently banned
									</p>
								)}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowBanDetailsDialog(false)}
						>
							Close
						</Button>
						{selectedUser?.banExpires &&
							new Date(selectedUser.banExpires) > new Date() && (
								<Button
									onClick={() => {
										setShowBanDetailsDialog(false);
										handleUnbanUser();
									}}
									className="bg-green-600 hover:bg-green-700"
								>
									<Unlock className="mr-2 h-4 w-4" />
									Unban User
								</Button>
							)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function SortIcon({ order }: { order: "asc" | "desc" }) {
	return order === "asc" ? (
		<ChevronUp className="h-4 w-4 ml-1" />
	) : (
		<ChevronDown className="h-4 w-4 ml-1" />
	);
}
