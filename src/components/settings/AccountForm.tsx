"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import PasswordChangeForm from "./PasswordChangeForm";
import { useUser } from "@/hooks/query/useUser";
import { Skeleton } from "../ui/skeleton";
import { debounce } from "lodash-es";
import { authClient } from "@/lib/auth-client";

const accountFormSchema = z.object({
	username: z
		.string()
		.min(2, {
			message: "Username must be at least 2 characters.",
		})
		.max(30, {
			message: "Username must not be longer than 30 characters.",
		}),
	email: z.string().email(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

interface UsernamePlugin {
	updateUser: (data: { username: string }) => Promise<{
		data?: unknown;
		error?: { message?: string };
	}>;
}

export function AccountForm() {
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const { data: user, isLoading: userLoading } = useUser();
	const [isUpdating, setIsUpdating] = useState(false);

	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues: {
			username: "",
			email: "",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				username: user.username || "",
				email: user.email || "",
			});
		}
	}, [user, form]);

	const handleUpdateUsername = async () => {
		const username = form.getValues("username");
		if (!username || username === user?.username) return;
		setIsUpdating(true);
		try {
			const safeUsername: string = typeof username === "string" ? username : "";
			const response = await (
				authClient as unknown as UsernamePlugin
			).updateUser({ username: safeUsername });
			if (response?.data) {
				toast({
					title: "Success",
					description: "Username updated successfully.",
				});
			} else {
				throw new Error(
					response?.error?.message || "Failed to update username",
				);
			}
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			toast({
				title: "Error",
				description: errorMsg || "Failed to update username",
				variant: "destructive",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<Form {...form}>
			<div className="space-y-8">
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<div className="flex items-center gap-2">
								<FormControl>
									{userLoading ? (
										<Skeleton className="h-10 w-full" />
									) : (
										<Input placeholder="Your username" {...field} />
									)}
								</FormControl>
								<Button
									type="button"
									disabled={
										userLoading ||
										isUpdating ||
										!field.value ||
										field.value === user?.username
									}
									onClick={handleUpdateUsername}
								>
									{isUpdating ? (
										<span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full inline-block" />
									) : null}
									Update
								</Button>
							</div>
							<FormDescription>
								This is your public display name. It can be your real name or a
								pseudonym. You can only change this once every 30 days.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								{userLoading ? (
									<Skeleton className="h-10 w-full" />
								) : (
									<Input placeholder="Your email" {...field} disabled />
								)}
							</FormControl>
							<FormDescription>
								You can manage verified email addresses in your email settings.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div>
					{!showPasswordForm ? (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
						>
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowPasswordForm(true)}
							>
								Change Password
							</Button>
						</motion.div>
					) : (
						<AnimatePresence>
							<motion.div
								initial={{ opacity: 0, height: 0, y: -20 }}
								animate={{ opacity: 1, height: "auto", y: 0 }}
								exit={{ opacity: 0, height: 0, y: -20 }}
								transition={{
									duration: 0.3,
									ease: "easeInOut",
								}}
								className="overflow-hidden"
							>
								<div className="border rounded-lg p-4 bg-muted/50">
									<PasswordChangeForm
										onSuccess={() => setShowPasswordForm(false)}
										onCancel={() => setShowPasswordForm(false)}
									/>
								</div>
							</motion.div>
						</AnimatePresence>
					)}
				</div>
			</div>
		</Form>
	);
}
