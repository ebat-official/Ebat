"use client";

import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { FaGithub, FaLink, FaLinkedinIn } from "react-icons/fa";

interface ProfileUrlsSectionProps {
	form: UseFormReturn<any>;
	fields: UseFieldArrayReturn<any, any, any>["fields"];
	append: UseFieldArrayReturn<any, any, any>["append"];
}

export function ProfileUrlsSection({
	form,
	fields,
	append,
}: ProfileUrlsSectionProps) {
	const getPlaceholder = (type: string) => {
		switch (type) {
			case "linkedin":
				return "linkedin.com/in/username";
			case "github":
				return "github.com/username";
			default:
				return "example.com";
		}
	};

	return (
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
											placeholder={getPlaceholder(type)}
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

			{fields.length < 5 && (
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="mt-2"
					onClick={() => append({ value: "" })}
				>
					Add URL
				</Button>
			)}
		</div>
	);
}
