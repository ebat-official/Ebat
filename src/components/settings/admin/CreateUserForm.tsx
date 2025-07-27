"use client";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/db/schema/enums";
import { getAvailableRoles } from "@/auth/roleUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
	onSubmit: (data: CreateUserFormValues) => void;
	onCancel: () => void;
	loading?: boolean;
	currentUserRole?: UserRole;
}

export function CreateUserForm({
	onSubmit,
	onCancel,
	loading = false,
	currentUserRole,
}: CreateUserFormProps) {
	const form = useForm<CreateUserFormValues>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: UserRole.USER,
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Enter user name" {...field} />
							</FormControl>
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
								<Input placeholder="Enter user email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input
									type="password"
									placeholder="Enter password"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Password must be at least 8 characters and contain at least one
								special character.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="role"
					render={({ field }) => {
						// Get available roles based on current user's role
						const availableRoles = currentUserRole
							? getAvailableRoles(currentUserRole)
							: [UserRole.USER]; // Default to only USER if no current role

						// Update form value if current selection is not available
						if (currentUserRole && !availableRoles.includes(field.value)) {
							field.onChange(UserRole.USER);
						}

						return (
							<FormItem>
								<FormLabel>Role</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select role" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{availableRoles.map((role) => (
											<SelectItem key={role} value={role}>
												{role === UserRole.USER && "User"}
												{role === UserRole.EDITOR && "Editor"}
												{role === UserRole.MODERATOR && "Moderator"}
												{role === UserRole.ADMIN && "Admin"}
												{role === UserRole.SUPER_ADMIN && "Super Admin"}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						);
					}}
				/>

				<div className="flex justify-end space-x-2">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? "Creating..." : "Create User"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
