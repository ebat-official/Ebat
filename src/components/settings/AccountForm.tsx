"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { useEffect, useState } from "react";
import PasswordChangeForm from "./PasswordChangeForm";
import { useUser } from "@/hooks/query/useUser";
import { Skeleton } from "../ui/skeleton";

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

export function AccountForm() {
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const { data: user, isLoading: userLoading } = useUser();

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
								<Button type="button">Update</Button>
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
