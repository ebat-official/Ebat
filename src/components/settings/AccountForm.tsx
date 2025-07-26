"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, X, Loader2 } from "lucide-react";

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
import { useEffect, useRef, useState, useCallback } from "react";
import PasswordChangeForm from "./PasswordChangeForm";
import { useUser } from "@/hooks/query/useUser";
import { Skeleton } from "../ui/skeleton";
import { debounce } from "lodash-es";
import { authClient } from "@/lib/auth-client";
import { USERNAME_STATUS } from "@/utils/constants";

const accountFormSchema = z.object({
	username: z
		.string()
		.min(4, {
			message: "Username must be at least 4 characters.",
		})
		.max(30, {
			message: "Username must not be longer than 30 characters.",
		}),
	email: z.string().email(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// Username availability status
type UsernameStatus = (typeof USERNAME_STATUS)[keyof typeof USERNAME_STATUS];

export function AccountForm() {
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const { data: user, isLoading: userLoading } = useUser();
	const [isUpdating, setIsUpdating] = useState(false);
	const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>(
		USERNAME_STATUS.IDLE,
	);
	const [currentUsername, setCurrentUsername] = useState("");

	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues: {
			username: "",
			email: "",
		},
	});

	// Check username availability function
	const checkUsernameAvailability = useCallback(
		async (username: string) => {
			if (!username || username.length < 4) {
				setUsernameStatus(USERNAME_STATUS.IDLE);
				// Clear any form errors when username is too short
				if (form.formState.errors.username) {
					form.clearErrors("username");
				}
				return;
			}

			// Don't check if it's the current user's username
			if (username === user?.username) {
				setUsernameStatus(USERNAME_STATUS.AVAILABLE);
				// Clear any form errors when it's the current username
				if (form.formState.errors.username) {
					form.clearErrors("username");
				}
				return;
			}

			setUsernameStatus(USERNAME_STATUS.CHECKING);

			try {
				const response = await authClient.isUsernameAvailable({
					username: username,
				});

				if (response.data?.available) {
					setUsernameStatus(USERNAME_STATUS.AVAILABLE);
					// Clear any form errors when username becomes available
					if (form.formState.errors.username) {
						form.clearErrors("username");
					}
				} else {
					setUsernameStatus(USERNAME_STATUS.UNAVAILABLE);
					// Set form error immediately when username is unavailable
					form.setError("username", {
						type: "manual",
						message: "Username is already taken.",
					});
				}
			} catch (error) {
				console.error("Error checking username availability:", error);
				setUsernameStatus(USERNAME_STATUS.ERROR);
			}
		},
		[user?.username, form],
	);

	// Debounced username check
	const debouncedCheckUsername = useCallback(
		debounce((username: string) => {
			checkUsernameAvailability(username);
		}, 500),
		[checkUsernameAvailability],
	);

	useEffect(() => {
		if (user) {
			form.reset({
				username: user.username || "",
				email: user.email || "",
			});
			setCurrentUsername(user.username || "");
		}
	}, [user, form]);

	// Watch username field for real-time checking
	const watchedUsername = form.watch("username");
	useEffect(() => {
		if (watchedUsername !== currentUsername) {
			debouncedCheckUsername(watchedUsername);
			// Clear any existing form errors when username changes
			if (form.formState.errors.username) {
				form.clearErrors("username");
			}
		}
	}, [watchedUsername, currentUsername, debouncedCheckUsername, form]);

	const handleUpdateUsername = async (values: AccountFormValues) => {
		const username = values.username;
		if (!username || username === user?.username) return;

		// Don't allow update if username is unavailable
		if (usernameStatus === USERNAME_STATUS.UNAVAILABLE) {
			form.setError("username", {
				type: "manual",
				message: "Username is already taken.",
			});
			return;
		}

		setIsUpdating(true);
		try {
			const safeUsername: string = typeof username === "string" ? username : "";
			const response = await authClient.updateUser({ username: safeUsername });
			if (response?.data) {
				toast({
					title: "Success",
					description: "Username updated successfully.",
				});
				setCurrentUsername(username);
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

	// Get status icon and color
	const getStatusIcon = () => {
		switch (usernameStatus) {
			case USERNAME_STATUS.CHECKING:
				return (
					<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
				);
			case USERNAME_STATUS.AVAILABLE:
				return <Check className="h-4 w-4 text-green-500" />;
			case USERNAME_STATUS.UNAVAILABLE:
				return <X className="h-4 w-4 text-red-500" />;
			default:
				return null;
		}
	};

	// Get status message
	const getStatusMessage = () => {
		if (!watchedUsername || watchedUsername.length < 4) return null;

		switch (usernameStatus) {
			case USERNAME_STATUS.CHECKING:
				return "Checking availability...";
			case USERNAME_STATUS.AVAILABLE:
				return "Username is available";
			case USERNAME_STATUS.UNAVAILABLE:
				// Don't show status message for unavailable, let form error handle it
				return null;
			case USERNAME_STATUS.ERROR:
				return "Error checking availability";
			default:
				return null;
		}
	};

	return (
		<Form {...form}>
			<div className="space-y-8">
				<form onSubmit={form.handleSubmit(handleUpdateUsername)}>
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
											<div className="relative w-full">
												<Input placeholder="Your username" {...field} />
												{watchedUsername && watchedUsername.length >= 4 && (
													<div className="absolute right-3 top-1/2 -translate-y-1/2">
														{getStatusIcon()}
													</div>
												)}
											</div>
										)}
									</FormControl>
									<Button
										type="submit"
										disabled={
											userLoading ||
											isUpdating ||
											!field.value ||
											field.value === user?.username ||
											usernameStatus === USERNAME_STATUS.UNAVAILABLE ||
											usernameStatus === USERNAME_STATUS.CHECKING
										}
									>
										{isUpdating ? (
											<span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full inline-block" />
										) : null}
										Update
									</Button>
								</div>
								{watchedUsername && watchedUsername.length >= 4 && (
									<div className="flex items-center gap-2 text-sm">
										{getStatusMessage()}
									</div>
								)}
								<FormDescription>
									This is your public display name. It can be your real name or
									a pseudonym. You can only change this once every 30 days.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</form>
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
