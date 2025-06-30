"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
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
import useCompanies from "@/hooks/useCompanyList";
import { useRef, useState } from "react";
import {
	FaGithub,
	FaLink,
	FaLinkedinIn,
	FaCamera,
	FaTrash,
	FaPlus,
} from "react-icons/fa";

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
								This is the email address you used to log in. It cannot be
								changed here.
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
								You can <span>@mention</span> other users and organizations to
								link to them.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="company"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Company</FormLabel>
							<FormControl>
								<div>
									<Input
										type="search"
										placeholder="Search for your company"
										value={field.value || ""}
										onChange={(e) => handleInputChange(e, field.onChange)}
										autoComplete="off"
									/>

									{companies.length > 0 && field.value && (
										<div className="mt-2 border rounded">
											{companies.map((company) => (
												<button
													type="button"
													key={company.label}
													className="flex items-center gap-2 px-4 py-2 cursor-pointer w-full text-left"
													onClick={() => field.onChange(company.label)}
												>
													{company.icon}
													<span>{company.label}</span>
												</button>
											))}
										</div>
									)}
								</div>
							</FormControl>
							<FormDescription>
								Enter the name of the company you are currently working for.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="currentPosition"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Current Position</FormLabel>
							<FormControl>
								<Input placeholder="Your current position" {...field} />
							</FormControl>
							<FormDescription>
								Enter your current job title or position.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="experience"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Experience</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select experience" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="1+">1+ years</SelectItem>
									<SelectItem value="2+">2+ years</SelectItem>
									<SelectItem value="3+">3+ years</SelectItem>
									<SelectItem value="4+">4+ years</SelectItem>
									<SelectItem value="5+">5+ years</SelectItem>
									<SelectItem value="6+">6+ years</SelectItem>
									<SelectItem value="7+">7+ years</SelectItem>
									<SelectItem value="8+">8+ years</SelectItem>
									<SelectItem value="9+">9+ years</SelectItem>
									<SelectItem value="10+">10+ years</SelectItem>
								</SelectContent>
							</Select>
							<FormDescription>
								Select your years of professional experience.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div>
					{fields.map((item, index) => {
						const type =
							item.type ||
							(index === 0 ? "linkedin" : index === 1 ? "github" : "other");
						const Icon =
							type === "linkedin"
								? FaLinkedinIn
								: type === "github"
									? FaGithub
									: FaLink;

						return (
							<FormField
								key={item.id}
								control={form.control}
								name={`urls.${index}.value`}
								render={({ field }) => (
									<FormItem className="relative">
										<FormControl>
											<div className="relative">
												<span className="absolute inset-y-0 left-2 flex items-center text-gray-500">
													<Icon />
												</span>
												<Input
													{...field}
													placeholder="Add URL"
													className="pl-8"
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						);
					})}

					<Button
						type="button"
						variant="outline"
						size="sm"
						className="mt-2"
						onClick={() => append({ value: "" })}
					>
						Add URL
					</Button>
				</div>
				<Button type="submit">Update profile</Button>
			</form>
		</Form>
	);
}
