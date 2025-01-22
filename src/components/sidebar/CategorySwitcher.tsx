"use client";

import type React from "react";
import { use, useEffect, useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useSidebar } from "@/context/SidebarContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";

export function CategorySwitcher() {
	const { config } = useSidebar();
	const { categories } = config;
	const isMobile = useIsMobile();
	const router = useRouter();
	const pathname = usePathname();
	const [activeCategoryLocalIndex, setActiveCategoryLocalIndex] =
		useLocalStorage<number>("categoryIndex", 0);
	const { isOpen } = useSidebar();
	const [activeCategory, setActiveCategory] = useState(
		() =>
			categories.find((category) => pathname.startsWith(category.route)) ||
			categories[activeCategoryLocalIndex],
	);

	useEffect(() => {
		if (pathname.startsWith(activeCategory.route)) return;
		router.push(activeCategory.route);
	}, [activeCategory]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.altKey) {
				const key = event.code;
				const index = Number.parseInt(key.at(-1) as string, 10) - 1;
				if (index >= 0 && index < categories.length) {
					setActiveCategory(categories[index]);
					setActiveCategoryLocalIndex(index);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="w-full justify-start h-12 focus-visible:ring-0"
				>
					<div className="w-full items-center flex justify-between">
						<div className="flex items-center">
							<span className="mr-4">
								<activeCategory.logo
									className={cn("!size-8 ", activeCategory.logoClassName)}
								/>
							</span>
							<p
								className={cn(
									"max-w-[150px] truncate",
									isOpen
										? "translate-x-0 opacity-100 delay-75"
										: "-translate-x-96 opacity-0",
								)}
							>
								{activeCategory.name}
							</p>
						</div>
						<div
							className={cn(
								"whitespace-nowrap",
								isOpen
									? "translate-x-0 opacity-100 delay-100"
									: "-translate-x-96 opacity-0",
							)}
						>
							<ChevronsUpDown
								size={18}
								className="transition-transform duration-200"
							/>
						</div>
					</div>
				</Button>

				{/* <Button
					variant="outline"
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<Card
						className={cn("flex items-center gap-2 p-1 rounded-lg", {
							"mr-4": isOpen,
						})}
					>
						<activeCategory.logo
							className={cn("size-6", activeCategory.logoClassName)}
						/>
					</Card>
					<div className="grid flex-1 text-base leading-tight text-left">
						<span className="font-semibold truncate">
							{activeCategory.name}
						</span>
					</div>
					<ChevronsUpDown className="ml-auto p-2 mr-4" />
				</Button> */}
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				align="start"
				side={isMobile ? "bottom" : "right"}
				sideOffset={4}
			>
				<DropdownMenuLabel className="text-xs text-muted-foreground">
					categories
				</DropdownMenuLabel>
				{categories.map((team, index) => (
					<DropdownMenuItem
						key={team.name}
						onClick={() => {
							setActiveCategory(team);
							setActiveCategoryLocalIndex(index);
						}}
						className="gap-2 p-2"
					>
						<div className="flex items-center justify-center border rounded-sm size-6">
							<team.logo className="size-4 shrink-0" />
						</div>
						{team.name}
						<DropdownMenuShortcut>⌥ + {index + 1}</DropdownMenuShortcut>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem className="gap-2 p-2">
					<div className="flex items-center justify-center border rounded-md size-6 bg-background">
						<Plus className="size-4" />
					</div>
					<div className="font-medium text-muted-foreground">Add team</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
