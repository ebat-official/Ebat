"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { BanUserForm } from "./BanUserForm";
import type { BanUserFormValues } from "./BanUserForm";
import { BanUserData, User } from "./types";
import { useLoadingState } from "./useLoadingState";

interface BanUserDialogProps {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function BanUserDialog({
	user,
	open,
	onOpenChange,
	onSuccess,
}: BanUserDialogProps) {
	const { loading, setLoading } = useLoadingState();

	const handleBanUser = async (data: BanUserFormValues) => {
		if (!user) return;

		await authClient.admin.banUser(
			{
				userId: user.id,
				banReason: data.reason,
				banExpiresIn: data.expiresIn ? data.expiresIn.getTime() : undefined,
			},
			{
				onRequest: () => {
					setLoading(true);
				},
				onSuccess: () => {
					toast.success("User banned successfully");
					onOpenChange(false);
					onSuccess();
				},
				onError: (error) => {
					console.error("Error banning user:", error);
					toast.error("Failed to ban user");
				},
				onResponse: () => {
					setLoading(false);
				},
				timeout: 10000,
			},
		);
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ban User</DialogTitle>
					<DialogDescription>
						Ban {user?.name} from the platform.
					</DialogDescription>
				</DialogHeader>
				<BanUserForm
					onSubmit={handleBanUser}
					onCancel={handleCancel}
					loading={loading}
				/>
			</DialogContent>
		</Dialog>
	);
}
