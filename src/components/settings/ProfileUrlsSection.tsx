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
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ProfileFormValues } from "@/actions/user";
import { FaGithub, FaLink, FaLinkedinIn } from "react-icons/fa";
import { X } from "lucide-react";

interface ProfileUrlsSectionProps {
	form: UseFormReturn<ProfileFormValues>;
	fields: UseFieldArrayReturn<ProfileFormValues, "urls">["fields"];
	append: UseFieldArrayReturn<ProfileFormValues, "urls">["append"];
	remove: UseFieldArrayReturn<ProfileFormValues, "urls">["remove"];
	isLoading: boolean;
}

export function ProfileUrlsSection({
	form,
	fields,
	append,
	remove,
	isLoading,
}: ProfileUrlsSectionProps) {
	if (isLoading) {
		return (
			<div className="space-y-4">
				{/* Skeleton for Label and Description */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-full max-w-sm" />
				</div>

				{/* Skeleton for first URL input */}
				<div className="flex items-center gap-2">
					<Skeleton className="h-10 flex-grow" />
				</div>

				{/* Skeleton for second URL input */}
				<div className="flex items-center gap-2">
					<Skeleton className="h-10 flex-grow" />
				</div>

				{/* Skeleton for Add URL button */}
				<Skeleton className="h-9 w-24 mt-2" />
			</div>
		);
	}

	const getIcon = (type?: string) => {
		switch (type) {
			case "linkedin":
				return <FaLinkedinIn className="text-muted-foreground" />;
			case "github":
				return <FaGithub className="text-muted-foreground" />;
			default:
				return <FaLink className="text-muted-foreground" />;
		}
	};

	const getPlaceholder = (type?: string) => {
		switch (type) {
			case "linkedin":
				return "linkedin.com/in/username";
			case "github":
				return "github.com/username";
			default:
				return "your-website.com";
		}
	};

	return (
		<div className="space-y-4">
			<FormLabel>URLs</FormLabel>
			<FormDescription>
				Add links to your website, blog, or social media profiles.
			</FormDescription>
			{fields.map((field, index) => (
				<FormField
					control={form.control}
					key={field.id}
					name={`urls.${index}.value`}
					render={({ field: renderField }) => (
						<FormItem>
							<div className="flex items-center gap-2">
								<div className="relative flex-grow">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
										{getIcon(field.type)}
									</div>
									<FormControl>
										<Input
											{...renderField}
											placeholder={getPlaceholder(field.type)}
											className="pl-10"
										/>
									</FormControl>
								</div>
								{index > 1 && (
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => remove(index)}
										className="shrink-0"
									>
										<X className="h-4 w-4" />
									</Button>
								)}
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			))}
			{fields.length < 5 && (
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="mt-2"
					onClick={() => append({ value: "", type: "other" })}
				>
					Add URL
				</Button>
			)}
		</div>
	);
}
