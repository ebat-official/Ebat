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

interface ProfileBasicInfoProps {
	form: UseFormReturn<any>;
}

export function ProfileBasicInfo({ form }: ProfileBasicInfoProps) {
	return (
		<>
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Name</FormLabel>
						<FormControl>
							<Input placeholder="Your name" {...field} />
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
							<Input
								placeholder="Your email"
								{...field}
								readOnly
								className=" cursor-not-allowed"
							/>
						</FormControl>
						<FormDescription>
							This is the email address you used to log in. It cannot be changed
							here.
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
							<Textarea
								placeholder="Tell us a little bit about yourself"
								className="resize-none"
								{...field}
							/>
						</FormControl>
						<FormDescription>
							This will be shown on your profile.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}
