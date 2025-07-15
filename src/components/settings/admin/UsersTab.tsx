"use client";

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { UserRole } from "@/db/schema/enums";
import { useState } from "react";
import type { Session, User } from "../types";
import { AdminSessionsTable } from "./AdminSessionsTable";
import { AdminUserTable } from "./AdminUserTable";
import { BanUserDialog } from "./BanUserDialog";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { CreateUserDialog } from "./CreateUserDialog";
import { useSessionActions } from "./useSessionActions";
import { useUserActions } from "./useUserActions";
import { useUsers } from "./useUsers";

interface UsersTabProps {
	onLoadSessions: (sessions: Session[]) => void;
}

export function UsersTab({ onLoadSessions }: UsersTabProps) {
	const {
		users,
		currentPage,
		setCurrentPage,
		loading,
		searchQuery,
		setSearchQuery,
		sortField,
		setSortField,
		sortOrder,
		setSortOrder,
		totalPages,
		loadUsers,
	} = useUsers();

	const {
		updateUserRole,
		deleteUser,
		unbanUser,
		impersonateUser,
		loading: actionLoading,
		isAnyLoading,
	} = useUserActions({
		onUsersChange: loadUsers,
	});

	const { loadUserSessions } = useSessionActions();

	// Dialog states
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [showBanDialog, setShowBanDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showUnbanDialog, setShowUnbanDialog] = useState(false);
	const [showRoleDialog, setShowRoleDialog] = useState(false);
	const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

	const handleBanUser = (userId: string) => {
		const user = users.find((u) => u.id === userId);
		if (user) {
			setSelectedUser(user);
			setShowBanDialog(true);
		}
	};

	const handleUnbanUser = (userId: string) => {
		const user = users.find((u) => u.id === userId);
		if (user) {
			setSelectedUser(user);
			setShowUnbanDialog(true);
		}
	};

	const handleDeleteUser = (userId: string) => {
		const user = users.find((u) => u.id === userId);
		if (user) {
			setSelectedUser(user);
			setShowDeleteDialog(true);
		}
	};

	const handleSetRole = (userId: string, role: UserRole) => {
		const user = users.find((u) => u.id === userId);
		if (user) {
			setSelectedUser(user);
			setPendingRole(role);
			setShowRoleDialog(true);
		}
	};

	const handleLoadSessions = async (userId: string) => {
		const sessions = await loadUserSessions(userId);
		onLoadSessions(sessions);
	};

	const confirmUnban = async () => {
		if (selectedUser) {
			await unbanUser(selectedUser.id);
			setShowUnbanDialog(false);
			setSelectedUser(null);
		}
	};

	const confirmDelete = async () => {
		if (selectedUser) {
			await deleteUser(selectedUser.id);
			setShowDeleteDialog(false);
			setSelectedUser(null);
		}
	};

	const confirmRoleChange = async () => {
		if (selectedUser && pendingRole) {
			await updateUserRole(selectedUser.id, pendingRole);
			setShowRoleDialog(false);
			setSelectedUser(null);
			setPendingRole(null);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">Users Management</h2>
				<CreateUserDialog onSuccess={loadUsers} />
			</div>

			<AdminUserTable
				users={users}
				loading={loading}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				onBanUser={handleBanUser}
				onUnbanUser={handleUnbanUser}
				onSetRole={handleSetRole}
				onDeleteUser={handleDeleteUser}
				onImpersonateUser={impersonateUser}
				onLoadSessions={handleLoadSessions}
				userSortField={sortField}
				userSortOrder={sortOrder}
				setUserSortField={(field: keyof User) => setSortField(field)}
				setUserSortOrder={setSortOrder}
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
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<PaginationItem key={page}>
								<PaginationLink
									onClick={() => setCurrentPage(page)}
									isActive={currentPage === page}
								>
									{page}
								</PaginationLink>
							</PaginationItem>
						))}
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

			{/* Dialogs */}
			<BanUserDialog
				user={selectedUser}
				open={showBanDialog}
				onOpenChange={setShowBanDialog}
				onSuccess={loadUsers}
			/>

			<ConfirmationDialog
				open={showUnbanDialog}
				onOpenChange={setShowUnbanDialog}
				onConfirm={confirmUnban}
				title="Unban User"
				description={`Are you sure you want to unban ${selectedUser?.name}?`}
				confirmText="Unban"
			/>

			<ConfirmationDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				onConfirm={confirmDelete}
				title="Delete User"
				description="Are you sure you want to delete this user? This action cannot be undone."
				confirmText="Delete"
				variant="destructive"
			/>

			<ConfirmationDialog
				open={showRoleDialog}
				onOpenChange={setShowRoleDialog}
				onConfirm={confirmRoleChange}
				title="Change User Role"
				description={`Are you sure you want to change this user's role to ${pendingRole}?`}
				confirmText="Confirm"
			/>
		</div>
	);
}
