"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

	// Form states
	const [newUser, setNewUser] = useState({
		name: "",
		email: "",
		password: "",
		role: UserRole.USER,
	});
	const [banData, setBanData] = useState({
		reason: "",
		expiresIn: "",
	});

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

			// Use type assertion to handle the response
			const data = response as any;
			if (data?.data?.users) {
				setUsers(data.data.users);
				setTotalUsers(data.data.total || 0);
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

	const handleCreateUser = async () => {
		try {
			await authClient.admin.createUser({
				name: newUser.name,
				email: newUser.email,
				password: newUser.password,
				role: newUser.role,
			});
			toast.success("User created successfully");
			setShowCreateUser(false);
			setNewUser({ name: "", email: "", password: "", role: UserRole.USER });
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
					? Number.parseInt(banData.expiresIn) * 24 * 60 * 60
					: undefined,
			});
			toast.success("User banned successfully");
			setShowBanUser(false);
			setBanData({ reason: "", expiresIn: "" });
			loadUsers();
		} catch (error) {
			console.error("Failed to ban user:", error);
			toast.error("Failed to ban user");
		}
	};

	const handleUnbanUser = async () => {
		if (!selectedUser) return;
		try {
			await authClient.admin.unbanUser({
				userId: selectedUser.id,
			});
			toast.success("User unbanned successfully");
			setShowUnbanUser(false);
			loadUsers();
		} catch (error) {
			console.error("Failed to unban user:", error);
			toast.error("Failed to unban user");
		}
	};

	const handleSetRole = async (userId: string, role: string) => {
		try {
			await authClient.admin.setRole({
				userId,
				role: role as UserRole,
			});
			toast.success("User role updated successfully");
			loadUsers();
		} catch (error) {
			console.error("Failed to update user role:", error);
			toast.error("Failed to update user role");
		}
	};

	const handleDeleteUser = async (userId: string) => {
		try {
			await authClient.admin.removeUser({
				userId,
			});
			toast.success("User deleted successfully");
			loadUsers();
		} catch (error) {
			console.error("Failed to delete user:", error);
			toast.error("Failed to delete user");
		}
	};

	const handleImpersonateUser = async (userId: string) => {
		try {
			await authClient.admin.impersonateUser({
				userId,
			});
			toast.success("Impersonation started");
			// Redirect to home page
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
		<div className="space-y-6">
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
											<TableHead>User</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Role</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Created</TableHead>
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
											users.map((user) => (
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
																	{user.userName}
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
															<Badge variant="destructive">
																<Ban className="mr-1 h-3 w-3" />
																Banned
															</Badge>
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
																<Button variant="ghost" className="h-8 w-8 p-0">
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
																	onClick={() => handleImpersonateUser(user.id)}
																>
																	<Eye className="mr-2 h-4 w-4" />
																	Impersonate
																</DropdownMenuItem>
																{user.banned === true ? (
																	<DropdownMenuItem
																		onClick={() => {
																			setSelectedUser(user);
																			setShowUnbanUser(true);
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
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={newUser.name}
								onChange={(e) =>
									setNewUser({ ...newUser, name: e.target.value })
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={newUser.email}
								onChange={(e) =>
									setNewUser({ ...newUser, email: e.target.value })
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={newUser.password}
								onChange={(e) =>
									setNewUser({ ...newUser, password: e.target.value })
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="role">Role</Label>
							<Select
								value={newUser.role}
								onValueChange={(value) =>
									setNewUser({ ...newUser, role: value as UserRole })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={UserRole.USER}>User</SelectItem>
									<SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowCreateUser(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreateUser}>Create User</Button>
					</DialogFooter>
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
							<Label htmlFor="banExpires">Ban Duration (Days, Optional)</Label>
							<Input
								id="banExpires"
								type="number"
								placeholder="Leave empty for permanent ban"
								value={banData.expiresIn}
								onChange={(e) =>
									setBanData({ ...banData, expiresIn: e.target.value })
								}
							/>
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
						<Button onClick={handleUnbanUser}>Unban User</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* User Sessions Dialog */}
			<Dialog open={showSessions} onOpenChange={setShowSessions}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>User Sessions</DialogTitle>
						<DialogDescription>
							Active sessions for {selectedUser?.name}
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<div className="flex justify-between items-center mb-4">
							<h4 className="text-sm font-medium">Active Sessions</h4>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									selectedUser && handleRevokeAllSessions(selectedUser.id)
								}
							>
								Revoke All Sessions
							</Button>
						</div>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Session ID</TableHead>
										<TableHead>IP Address</TableHead>
										<TableHead>User Agent</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Expires</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{userSessions.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center">
												No active sessions found
											</TableCell>
										</TableRow>
									) : (
										userSessions.map((session) => (
											<TableRow key={session.id}>
												<TableCell className="font-mono text-sm">
													{session.id.slice(0, 8)}...
												</TableCell>
												<TableCell>{session.ipAddress || "Unknown"}</TableCell>
												<TableCell className="max-w-xs truncate">
													{session.userAgent || "Unknown"}
												</TableCell>
												<TableCell>
													{new Date(session.createdAt).toLocaleDateString()}
												</TableCell>
												<TableCell>
													{new Date(session.expiresAt).toLocaleDateString()}
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleRevokeSession(session.token)}
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
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowSessions(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
