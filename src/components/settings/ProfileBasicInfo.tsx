"use client";

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Skeleton } from "../ui/skeleton";

interface ProfileBasicInfoProps {
	form: UseFormReturn<any>;
	isLoading: boolean;
}

export function ProfileBasicInfo({ form, isLoading }: ProfileBasicInfoProps) {
	return (
		<>
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Name</FormLabel>
						<FormControl>
							{isLoading ? (
								<Skeleton className="h-10 w-full" />
							) : (
								<Input placeholder="Your name" {...field} />
							)}
						</FormControl>
						<FormDescription>
							This is the name that will be displayed on your profile and in
							emails.
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
							{isLoading ? (
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
			<FormField
				control={form.control}
				name="bio"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Bio</FormLabel>
						<FormControl>
							{isLoading ? (
								<Skeleton className="h-24 w-full" />
							) : (
								<Textarea
									placeholder="Tell us a little bit about yourself"
									className="resize-none"
									{...field}
								/>
							)}
						</FormControl>
						<FormDescription>
							This will be shown on your public profile.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}
