"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";

function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null; // avoid rehydration errors
	return (
		<TooltipProvider disableHoverableContent>
			<Tooltip delayDuration={500}>
				<TooltipTrigger asChild>
					<div>
						<div className="hidden md:block">
							<Tabs defaultValue={theme}>
								<TabsList className="border">
									<TabsTrigger value="light" onClick={() => setTheme("light")}>
										<SunIcon className="h-[1.2rem] w-[1.2rem]" />
									</TabsTrigger>
									<TabsTrigger value="dark" onClick={() => setTheme("dark")}>
										<MoonIcon className="h-[1.2rem] w-[1.2rem] rotate-90 transition-all dark:rotate-0" />
									</TabsTrigger>
									<TabsTrigger
										value="system"
										onClick={() => setTheme("system")}
									>
										<DesktopIcon className="h-[1.2rem] w-[1.2rem]" />
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
						<div className="md:hidden">
							<Button
								className="rounded-full w-8 h-8 bg-background mr-2"
								variant="outline"
								size="icon"
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							>
								<SunIcon className="w-[1.2rem] h-[1.2rem] rotate-90 scale-0 transition-transform ease-in-out duration-500 dark:rotate-0 dark:scale-100" />
								<MoonIcon className="absolute w-[1.2rem] h-[1.2rem] rotate-0  transition-transform ease-in-out duration-500 dark:-rotate-90 dark:scale-0" />
								<span className="sr-only">Switch Theme</span>
							</Button>
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom">Switch Theme</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export default ThemeSwitcher;
