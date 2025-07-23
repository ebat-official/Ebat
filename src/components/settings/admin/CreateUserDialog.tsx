"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { UserRole } from "@/db/schema/enums";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { CreateUserForm } from "./CreateUserForm";
import { CreateUserData } from "./types";
import { useLoadingState } from "./useLoadingState";

interface CreateUserDialogProps {
	onSuccess: () => void;
}

export function CreateUserDialog({ onSuccess }: CreateUserDialogProps) {
	const [open, setOpen] = useState(false);
	const { loading, setLoading } = useLoadingState();

	const handleCreateUser = async (data: CreateUserData) => {
		await authClient.admin.createUser(
			{
				email: data.email,
				password: data.password || "",
				name: data.name,
				// @ts-ignore
				role: data.role,
			},
			{
				onRequest: () => {
					setLoading(true);
				},
				onSuccess: () => {
					toast.success("User created successfully");
					setOpen(false);
					onSuccess();
				},
				onError: (error) => {
					console.error("Error creating user:", error);
					toast.error("Failed to create user");
				},
				onResponse: () => {
					setLoading(false);
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

	const handleCancel = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
					onCancel={handleCancel}
					loading={loading}
				/>
			</DialogContent>
		</Dialog>
	);
}
