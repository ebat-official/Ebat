"use client";

import { UserRole } from "@/db/schema/enums";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { User } from "../types";
import { useMultiLoadingState } from "./useLoadingState";

interface UseUserActionsProps {
	onUsersChange: () => void;
}

export function useUserActions({ onUsersChange }: UseUserActionsProps) {
	const router = useRouter();
	const { loading, setLoading } = useMultiLoadingState();

	const updateUserRole = async (userId: string, role: UserRole) => {
		await authClient.admin.setRole(
			{
				userId,
				// @ts-ignore
				role,
			},
			{
				onRequest: () => {
					setLoading("updateRole", true);
				},
				onSuccess: () => {
					toast.success("User role updated successfully");
					onUsersChange();
				},
				onError: (error) => {
					console.error("Error updating user role:", error);
					toast.error("Failed to update user role");
				},
				onResponse: () => {
					setLoading("updateRole", false);
				},
				timeout: 10000,
				retry: {
					type: "linear",
					attempts: 2,
					delay: 1000,
				},
			},
		);
	};

	const deleteUser = async (userId: string) => {
		await authClient.admin.removeUser(
			{
				userId,
			},
			{
				onRequest: () => {
					setLoading("deleteUser", true);
				},
				onSuccess: () => {
					toast.success("User deleted successfully");
					onUsersChange();
				},
				onError: (error) => {
					console.error("Error deleting user:", error);
					toast.error("Failed to delete user");
				},
				onResponse: () => {
					setLoading("deleteUser", false);
				},
				timeout: 10000,
			},
		);
	};

	const unbanUser = async (userId: string) => {
		await authClient.admin.unbanUser(
			{
				userId,
			},
			{
				onRequest: () => {
					setLoading("unbanUser", true);
				},
				onSuccess: () => {
					toast.success("User unbanned successfully");
					onUsersChange();
				},
				onError: (error) => {
					console.error("Error unbanning user:", error);
					toast.error("Failed to unban user");
				},
				onResponse: () => {
					setLoading("unbanUser", false);
				},
				timeout: 10000,
			},
		);
	};

	const impersonateUser = async (userId: string) => {
		await authClient.admin.impersonateUser(
			{
				userId,
			},
			{
				onRequest: () => {
					setLoading("impersonate", true);
				},
				onSuccess: (ctx) => {
					if (
						ctx.data?.session?.token &&
						typeof ctx.data.session.token === "string"
					) {
						toast.success("Impersonating user");
						setTimeout(() => {
							window.location.reload();
						}, 100);
					} else {
						toast.error("Invalid impersonation response");
					}
				},
				onError: (error) => {
					console.error("Error impersonating user:", error);
					toast.error("Failed to impersonate user");
				},
				onResponse: () => {
					setLoading("impersonate", false);
				},
				timeout: 10000,
			},
		);
	};

	return {
		loading,
		isAnyLoading: Object.values(loading).some(Boolean),
		updateUserRole,
		deleteUser,
		unbanUser,
		impersonateUser,
	};
}
