"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

function formatDate(date: Date | undefined) {
	if (!date) {
		return "";
	}

	return date.toLocaleDateString("en-US", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

const banUserSchema = z.object({
	reason: z.string().min(1, "Reason is required"),
	expiresIn: z.date().optional(),
});

export type BanUserFormValues = z.infer<typeof banUserSchema>;

interface BanUserFormProps {
	onSubmit: (data: BanUserFormValues) => void;
	onCancel: () => void;
	loading?: boolean;
}

export function BanUserForm({
	onSubmit,
	onCancel,
	loading = false,
}: BanUserFormProps) {
	const [banDateOpen, setBanDateOpen] = useState(false);
	const [banDateValue, setBanDateValue] = useState("");
	const [banDateMonth, setBanDateMonth] = useState<Date | undefined>(undefined);

	const form = useForm<BanUserFormValues>({
		resolver: zodResolver(banUserSchema),
		defaultValues: {
			reason: "",
			expiresIn: undefined,
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="reason"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Ban Reason</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Enter the reason for banning this user"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								This reason will be visible to the user and administrators.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="expiresIn"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Ban Expiry (Optional)</FormLabel>
							<div className="relative flex gap-2">
								<Input
									value={banDateValue}
									placeholder="Tomorrow, next week, or pick a date"
									className="bg-background pr-10"
									onChange={(e) => {
										setBanDateValue(e.target.value);
										// Simple date parsing for common phrases
										const text = e.target.value.toLowerCase();
										let date: Date | null = null;

										if (text.includes("tomorrow")) {
											date = new Date();
											date.setDate(date.getDate() + 1);
										} else if (text.includes("next week")) {
											date = new Date();
											date.setDate(date.getDate() + 7);
										} else if (text.includes("in 2 days")) {
											date = new Date();
											date.setDate(date.getDate() + 2);
										} else if (text.includes("in 3 days")) {
											date = new Date();
											date.setDate(date.getDate() + 3);
										} else if (text.includes("in 1 week")) {
											date = new Date();
											date.setDate(date.getDate() + 7);
										} else if (text.includes("in 2 weeks")) {
											date = new Date();
											date.setDate(date.getDate() + 14);
										} else if (text.includes("in 1 month")) {
											date = new Date();
											date.setMonth(date.getMonth() + 1);
										}

										if (date) {
											field.onChange(date);
											setBanDateValue(formatDate(date));
										}
									}}
									onKeyDown={(e) => {
										if (e.key === "ArrowDown") {
											e.preventDefault();
											setBanDateOpen(true);
										}
									}}
								/>
								<Popover open={banDateOpen} onOpenChange={setBanDateOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
										>
											<CalendarIcon className="size-3.5" />
											<span className="sr-only">Select date</span>
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto overflow-hidden p-0"
										align="end"
									>
										<Calendar
											mode="single"
											selected={field.value || undefined}
											captionLayout="dropdown"
											month={banDateMonth}
											onMonthChange={setBanDateMonth}
											onSelect={(date) => {
												field.onChange(date || undefined);
												setBanDateValue(formatDate(date));
												setBanDateOpen(false);
											}}
											disabled={(date) => date < new Date()}
										/>
									</PopoverContent>
								</Popover>
							</div>
							{field.value && (
								<div className="text-muted-foreground px-1 text-sm">
									User will be banned until{" "}
									<span className="font-medium">{formatDate(field.value)}</span>
									.
								</div>
							)}
							{field.value && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => {
										field.onChange(undefined);
										setBanDateValue("");
									}}
									className="text-red-600 hover:text-red-700"
								>
									Clear date (permanent ban)
								</Button>
							)}
							<FormDescription>Leave empty for permanent ban.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end space-x-2">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? "Banning..." : "Ban User"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
