"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function AppearanceForm() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null; // avoid rehydration errors

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h3 className="text-sm font-medium leading-none">Theme</h3>
				<p className="text-sm text-muted-foreground">
					Select the theme for the profile
				</p>
				<RadioGroup
					value={theme}
					onValueChange={setTheme}
					className="grid max-w-md grid-cols-3 gap-4 pt-2"
				>
					<div>
						<label
							htmlFor="theme-light"
							className="[&:has([data-state=checked])>div]:border-primary"
						>
							<RadioGroupItem
								value="light"
								id="theme-light"
								className="sr-only"
							/>
							<div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
								<div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
									<div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
										<div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
										<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
									</div>
									<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
										<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
										<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
									</div>
									<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
										<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
										<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
									</div>
								</div>
							</div>
							<span className="block w-full p-2 text-center font-normal">
								Light
							</span>
						</label>
					</div>
					<div>
						<label
							htmlFor="theme-dark"
							className="[&:has([data-state=checked])>div]:border-primary"
						>
							<RadioGroupItem
								value="dark"
								id="theme-dark"
								className="sr-only"
							/>
							<div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
								<div className="space-y-2 rounded-sm bg-slate-950 p-2">
									<div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
										<div className="h-2 w-[80px] rounded-lg bg-slate-400" />
										<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
									</div>
									<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
										<div className="h-4 w-4 rounded-full bg-slate-400" />
										<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
									</div>
									<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
										<div className="h-4 w-4 rounded-full bg-slate-400" />
										<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
									</div>
								</div>
							</div>
							<span className="block w-full p-2 text-center font-normal">
								Dark
							</span>
						</label>
					</div>
					<div>
						<label
							htmlFor="theme-system"
							className="[&:has([data-state=checked])>div]:border-primary"
						>
							<RadioGroupItem
								value="system"
								id="theme-system"
								className="sr-only"
							/>
							<div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
								<div className="space-y-2 rounded-sm bg-gradient-to-br from-[#ecedef] to-slate-950 p-2">
									<div className="space-y-2 rounded-md bg-gradient-to-br from-white to-slate-800 p-2 shadow-sm">
										<div className="h-2 w-[80px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400" />
										<div className="h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400" />
									</div>
									<div className="flex items-center space-x-2 rounded-md bg-gradient-to-br from-white to-slate-800 p-2 shadow-sm">
										<div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#ecedef] to-slate-400" />
										<div className="h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400" />
									</div>
									<div className="flex items-center space-x-2 rounded-md bg-gradient-to-br from-white to-slate-800 p-2 shadow-sm">
										<div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#ecedef] to-slate-400" />
										<div className="h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400" />
									</div>
								</div>
							</div>
							<span className="block w-full p-2 text-center font-normal">
								System
							</span>
						</label>
					</div>
				</RadioGroup>
			</div>
		</div>
	);
}
