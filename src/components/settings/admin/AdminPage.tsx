"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/db/schema/enums";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-client";
import {
	ArrowUpDown,
	Ban,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Eye,
	EyeOff,
	Shield,
	Unlock,
	Users,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Session, User } from "../types";
import { AdminUserTable } from "./AdminUserTable";
import { BanUserForm } from "./BanUserForm";
import { CreateUserForm } from "./CreateUserForm";
import type { CreateUserFormValues } from "./CreateUserForm";

export function AdminPage() {
	const { data: session } = useSession();
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
		role?: UserRole;
	} | null>(null);

	// Sorting states
	const [userSortField, setUserSortField] = useState<keyof User>("createdAt");
	const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("desc");
	const [sessionSortField, setSessionSortField] =
		useState<keyof Session>("createdAt");
	const [sessionSortOrder, setSessionSortOrder] = useState<"asc" | "desc">(
		"desc",
	);

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
				if (response.data.users && response.data.users.length > 0) {
				}
				// Cast the users array to our User interface
				setUsers((response.data.users || []) as User[]);
				setTotalUsers(response.data.total || 0);
			} else {
				setUsers([]);
				setTotalUsers(0);
			}
		} catch (error) {
			console.error("Error loading users:", error);
			toast.error("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateUser = async (data: CreateUserFormValues) => {
		try {
			//@ts-ignore
			await authClient.admin.createUser(data);
			toast.success("User created successfully");
			setShowCreateUser(false);
			loadUsers();
		} catch (error) {
			console.error("Error creating user:", error);
			toast.error("Failed to create user");
		}
	};

	const handleBanUser = async (userId: string) => {
		setSelectedUser(users.find((u) => u.id === userId) || null);
		setShowBanUser(true);
	};

	const handleUnbanUser = async (userId: string) => {
		setSelectedUser(users.find((u) => u.id === userId) || null);
		setShowUnbanUser(true);
	};

	const confirmUnbanUser = async () => {
		if (!selectedUser) return;

		try {
			await authClient.admin.unbanUser({ userId: selectedUser.id });
			toast.success("User unbanned successfully");
			setShowUnbanUser(false);
			setSelectedUser(null);
			loadUsers();
		} catch (error) {
			console.error("Error unbanning user:", error);
			toast.error("Failed to unban user");
		}
	};

	const handleSetRole = async (userId: string, role: UserRole) => {
		setPendingAction({ type: "role", userId, role });
		setShowRoleChangeDialog(true);
	};

	const confirmSetRole = async () => {
		if (!pendingAction || !pendingAction.role) return;

		try {
			await authClient.admin.setRole({
				userId: pendingAction.userId,
				//@ts-ignore
				role: pendingAction.role,
			});
			toast.success("User role updated successfully");
			setShowRoleChangeDialog(false);
			setPendingAction(null);
			loadUsers();
		} catch (error) {
			console.error("Error updating user role:", error);
			toast.error("Failed to update user role");
		}
	};

	const handleDeleteUser = async (userId: string) => {
		setPendingAction({ type: "delete", userId });
		setShowDeleteUserDialog(true);
	};

	const confirmDeleteUser = async () => {
		if (!pendingAction) return;

		try {
			await authClient.admin.removeUser({ userId: pendingAction.userId });
			toast.success("User deleted successfully");
			setShowDeleteUserDialog(false);
			setPendingAction(null);
			loadUsers();
		} catch (error) {
			console.error("Error deleting user:", error);
			toast.error("Failed to delete user");
		}
	};

	const handleImpersonateUser = async (userId: string) => {
		try {
			const response = await authClient.admin.impersonateUser({ userId });

			if (
				response?.data?.session?.token &&
				typeof response.data.session.token === "string"
			) {
				// Show success message first
				toast.success("Impersonating user");
				// Then reload the current page
				setTimeout(() => {
					window.location.reload();
				}, 100);
			} else {
				toast.error("Invalid impersonation response");
			}
		} catch (error) {
			console.error("Error impersonating user:", error);
			toast.error("Failed to impersonate user");
		}
	};

	const handleLoadSessions = async (userId: string) => {
		try {
			const response = await authClient.admin.listUserSessions({ userId });
			if ("data" in response && response.data) {
				const sessions = response.data.sessions || [];
				setUserSessions(sessions as Session[]);
				setSelectedUser(users.find((u) => u.id === userId) || null);
				setShowSessions(true);
			}
		} catch (error) {
			console.error("Error loading sessions:", error);
			toast.error("Failed to load user sessions");
		}
	};

	const handleRevokeSession = async (sessionToken: string) => {
		try {
			await authClient.admin.revokeUserSession({ sessionToken });
			toast.success("Session revoked successfully");
			// Add a small delay to ensure the backend has processed the revocation
			await new Promise((resolve) => setTimeout(resolve, 500));
			// Reload sessions for the currently selected user
			if (selectedUser) {
				await handleLoadSessions(selectedUser.id);
			}
		} catch (error) {
			console.error("Error revoking session:", error);
			toast.error("Failed to revoke session");
		}
	};

	const handleRevokeAllSessions = async (userId: string) => {
		try {
			await authClient.admin.revokeUserSessions({ userId });
			toast.success("All sessions revoked successfully");
			handleLoadSessions(userId);
		} catch (error) {
			console.error("Error revoking all sessions:", error);
			toast.error("Failed to revoke all sessions");
		}
	};

	const totalPages = Math.ceil(totalUsers / pageSize);

	// SortIcon component
	const SortIcon = ({ order }: { order: "asc" | "desc" }) => {
		return order === "asc" ? (
			<ChevronUp className="h-4 w-4 ml-1" />
		) : (
			<ChevronDown className="h-4 w-4 ml-1" />
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Admin Dashboard</h1>
					<p className="text-muted-foreground">
						Manage users, roles, and system settings.
					</p>
				</div>
				<Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
					<DialogTrigger asChild>
						<Button>Create User</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create New User</DialogTitle>
							<DialogDescription>
								Create a new user account with the specified role.
							</DialogDescription>
						</DialogHeader>
						<CreateUserForm
							onSubmit={handleCreateUser}
							onCancel={() => setShowCreateUser(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<Tabs defaultValue="users" className="space-y-4">
				<TabsList>
					<TabsTrigger value="users">Users</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="users" className="space-y-4">
					<AdminUserTable
						users={users}
						loading={loading}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						onBanUser={handleBanUser}
						onUnbanUser={handleUnbanUser}
						onSetRole={handleSetRole}
						onDeleteUser={handleDeleteUser}
						onImpersonateUser={handleImpersonateUser}
						onLoadSessions={handleLoadSessions}
						onShowBanDetails={(user) => {
							setSelectedUser(user);
							setShowBanDetailsDialog(true);
						}}
						userSortField={userSortField}
						userSortOrder={userSortOrder}
						setUserSortField={(field: keyof User) => setUserSortField(field)}
						setUserSortOrder={setUserSortOrder}
						currentUserRole={session?.user?.role as UserRole}
					/>

					{totalPages > 1 && (
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
										className={
											currentPage === 1 ? "pointer-events-none opacity-50" : ""
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

			{/* Ban User Dialog */}
			<Dialog open={showBanUser} onOpenChange={setShowBanUser}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ban User</DialogTitle>
						<DialogDescription>
							Ban {selectedUser?.name} from the platform.
						</DialogDescription>
					</DialogHeader>
					<BanUserForm
						onSubmit={async (data) => {
							try {
								await authClient.admin.banUser({
									userId: selectedUser!.id,
									banReason: data.reason,
									banExpiresIn: data.expiresIn
										? Math.floor(
												(data.expiresIn.getTime() - new Date().getTime()) /
													1000,
											)
										: undefined,
								});
								toast.success("User banned successfully");
								setShowBanUser(false);
								setSelectedUser(null);
								loadUsers();
							} catch (error) {
								console.error("Error banning user:", error);
								toast.error("Failed to ban user");
							}
						}}
						onCancel={() => {
							setShowBanUser(false);
							setSelectedUser(null);
						}}
					/>
				</DialogContent>
			</Dialog>

			{/* Confirmation Dialogs */}
			<AlertDialog
				open={showRoleChangeDialog}
				onOpenChange={setShowRoleChangeDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Change User Role</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to change this user's role to{" "}
							{pendingAction?.role}?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmSetRole}>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={showDeleteUserDialog}
				onOpenChange={setShowDeleteUserDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this user? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeleteUser}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={showUnbanUser} onOpenChange={setShowUnbanUser}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unban User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to unban {selectedUser?.name}?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmUnbanUser}>
							Unban
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* User Sessions Dialog */}
			<Dialog open={showSessions} onOpenChange={setShowSessions}>
				<DialogContent className="min-w-fit">
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
										handleUnbanUser(selectedUser!.id);
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
