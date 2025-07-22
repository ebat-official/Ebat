"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { toast } from "@/hooks/use-toast";
import useCompanies from "@/hooks/useCompanyList";
import { useServerAction } from "@/hooks/useServerAction";
import { useUser } from "@/hooks/query/useUser";
import { useEffect } from "react";
import { ProfileBasicInfo } from "./ProfileBasicInfo";
import { ProfileCompanyInfo } from "./ProfileCompanyInfo";
import { ProfileUrlsSection } from "./ProfileUrlsSection";
import { updateUserProfile } from "@/actions/user";
import type { ProfileFormValues } from "@/actions/user";
import { useQueryClient } from "@tanstack/react-query";

const profileFormSchema = z.object({
	name: z
		.string()
		.min(2, {
			message: "Name must be at least 2 characters.",
		})
		.max(30, {
			message: "Name must not be longer than 30 characters.",
		})
		.optional(),
	email: z
		.string({
			required_error: "Please select an email to display.",
		})
		.email()
		.optional(),
	bio: z.string().max(160).optional(),
	urls: z
		.array(
			z.object({
				value: z.string().refine(
					(value) => {
						if (!value) return true; // Allow empty values
						// Check if it's a valid URL with or without protocol
						try {
							// If it doesn't start with http/https, add https://
							const urlToTest =
								value.startsWith("http://") || value.startsWith("https://")
									? value
									: `https://${value}`;
							new URL(urlToTest);
							return true;
						} catch {
							return false;
						}
					},
					{ message: "Please enter a valid URL (protocol optional)." },
				),
				type: z.string().optional(),
			}),
		)
		.optional(),
	company: z.string().optional(),
	currentPosition: z.string().optional(),
	experience: z.number().min(0).optional(),
});

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
	bio: "I own a computer.",
	urls: [
		{ value: "", type: "linkedin" },
		{ value: "", type: "github" },
	],
};

export function ProfileForm() {
	const { companies, searchCompanies } = useCompanies();
	const { data: user, isLoading: userLoading } = useUser();
	const [updateProfileAction, isUpdating] = useServerAction(updateUserProfile);
	const queryClient = useQueryClient();

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues,
		mode: "onChange",
	});

	const { fields, append, remove } = useFieldArray({
		name: "urls",
		control: form.control,
	});

	// Hydrate form with user profile data
	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name || "",
				email: user.email || "",
				bio: user.description || "",
				company: user.companyName || "",
				currentPosition: user.jobTitle || "",
				experience: user.experience || 0,
				urls: Array.isArray(user.externalLinks)
					? user.externalLinks
					: defaultValues.urls,
			});
		}
	}, [user, form]);

	function onSubmit(data: ProfileFormValues) {
		updateProfileAction(data)
			.then(() => {
				// Invalidate and refetch user data to show updated profile
				queryClient.invalidateQueries({ queryKey: ["user"] });
				toast({
					title: "Profile updated!",
					description: "Your profile has been updated successfully.",
				});
			})
			.catch((error) => {
				toast({
					title: "Failed to update profile",
					description:
						error instanceof Error ? error.message : "An error occurred",
					variant: "destructive",
				});
			});
	}

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		onChange: (value: string) => void,
	) => {
		const value = e.target.value;
		onChange(value);
		searchCompanies(value);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<ProfileBasicInfo form={form} isLoading={userLoading} />
				<ProfileCompanyInfo
					form={form}
					companies={companies}
					handleInputChange={handleInputChange}
					isLoading={userLoading}
				/>
				<ProfileUrlsSection
					form={form}
					fields={fields}
					append={append}
					remove={remove}
					isLoading={userLoading}
				/>
				<Button type="submit" disabled={isUpdating || userLoading}>
					{isUpdating ? "Updating..." : "Update profile"}
				</Button>
			</form>
		</Form>
	);
}
