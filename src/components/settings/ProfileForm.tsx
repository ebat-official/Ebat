"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import useCompanies from "@/hooks/useCompanyList";
import { useRef, useState } from "react";
import {
	FaCamera,
	FaGithub,
	FaLink,
	FaLinkedinIn,
	FaPlus,
	FaTrash,
} from "react-icons/fa";
import { ProfileBasicInfo } from "./ProfileBasicInfo";
import { ProfileCompanyInfo } from "./ProfileCompanyInfo";
import { ProfileUrlsSection } from "./ProfileUrlsSection";

const profileFormSchema = z.object({
	name: z
		.string()
		.min(2, {
			message: "Name must be at least 2 characters.",
		})
		.max(30, {
			message: "Name must not be longer than 30 characters.",
		}),

	email: z
		.string({
			required_error: "Please select an email to display.",
		})
		.email(),
	bio: z.string().max(160).min(4),
	urls: z
		.array(
			z.object({
				value: z.string().url({ message: "Please enter a valid URL." }),
				type: z.string().optional(),
			}),
		)
		.optional(),
	company: z.string().optional(),
	currentPosition: z.string().optional(),
	experience: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

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

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues,
		mode: "onChange",
	});

	const { fields, append } = useFieldArray({
		name: "urls",
		control: form.control,
	});

	function onSubmit(data: ProfileFormValues) {
		toast({
			title: "You submitted the following values:",
			description: (
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(data, null, 2)}</code>
				</pre>
			),
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
				<ProfileBasicInfo form={form} />
				<ProfileCompanyInfo
					form={form}
					companies={companies}
					handleInputChange={handleInputChange}
				/>
				<ProfileUrlsSection form={form} fields={fields} append={append} />
				<Button type="submit">Update profile</Button>
			</form>
		</Form>
	);
}
