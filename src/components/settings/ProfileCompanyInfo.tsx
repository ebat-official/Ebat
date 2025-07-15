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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface ProfileCompanyInfoProps {
	form: UseFormReturn<any>;
	companies: Array<{ label: string; icon: React.ReactNode }>;
	handleInputChange: (
		e: React.ChangeEvent<HTMLInputElement>,
		onChange: (value: string) => void,
	) => void;
}

export function ProfileCompanyInfo({
	form,
	companies,
	handleInputChange,
}: ProfileCompanyInfoProps) {
	return (
		<>
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
												<span className="capitalize">{company.label}</span>
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
		</>
	);
}
