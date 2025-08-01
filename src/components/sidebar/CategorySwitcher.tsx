"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import type React from "react";
import { use, useEffect, useState } from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/context/SidebarContext";
import { useIsMobile } from "@/hooks/use-mobile";
import useLocalStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { PostCategory } from "@/db/schema/enums";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function CategorySwitcher() {
	const { config, setCurrentCategory } = useSidebar();
	const { categories } = config;
	const isMobile = useIsMobile();
	const router = useRouter();
	const pathname = usePathname();
	const [activeCategoryLocalIndex, setActiveCategoryLocalIndex] =
		useLocalStorage<number>("categoryIndex", 0);
	const { isOpen } = useSidebar();
	const [activeCategory, setActiveCategory] = useState(() => {
		// First try to find a category that matches the current pathname
		const categoryFromPath = categories.find((category) =>
			pathname.startsWith(category.route),
		);
		if (
			categoryFromPath &&
			!categoryFromPath.hide &&
			!categoryFromPath.disabled
		) {
			return categoryFromPath;
		}

		// If no valid category from path, try to get from local storage index
		const categoryFromIndex = categories[activeCategoryLocalIndex];
		if (
			categoryFromIndex &&
			!categoryFromIndex.hide &&
			!categoryFromIndex.disabled
		) {
			return categoryFromIndex;
		}

		// If both are hidden/disabled, find the first available category
		const firstAvailableCategory = categories.find(
			(category) => !category.hide && !category.disabled,
		);
		return firstAvailableCategory || categories[0];
	});

	// Update category based on pathname
	useEffect(() => {
		const categoryFromPath = categories.find((category) =>
			pathname.startsWith(category.route),
		);
		if (
			categoryFromPath &&
			!categoryFromPath.hide &&
			!categoryFromPath.disabled &&
			categoryFromPath !== activeCategory
		) {
			setActiveCategory(categoryFromPath);
			// Update the sidebar config based on the pathname
			if (pathname.startsWith(`/${PostCategory.FRONTEND}`)) {
				setCurrentCategory(PostCategory.FRONTEND);
			} else if (pathname.startsWith(`/${PostCategory.BACKEND}`)) {
				setCurrentCategory(PostCategory.BACKEND);
			} else if (pathname.startsWith(`/${PostCategory.ANDROID}`)) {
				setCurrentCategory(PostCategory.ANDROID);
			}
		}
	}, [pathname, categories, activeCategory, setCurrentCategory]);

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
					className="justify-start w-full h-12 focus-visible:ring-0"
				>
					<div className="flex items-center justify-between w-full">
						<div className="flex items-center">
							<span className="mr-4">
								<activeCategory.logo
									className={cn("size-8! ", activeCategory.logoClassName)}
								/>
							</span>
							<p
								className={cn(
									"max-w-[150px] truncate",
									isOpen
										? "translate-x-0 opacity-100 transition-opacity duration-100"
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
									? "translate-x-0 opacity-100 delay-75"
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
					<ChevronsUpDown className="p-2 ml-auto mr-4" />
				</Button> */}
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
				align="start"
				side={isMobile ? "bottom" : "right"}
				sideOffset={4}
			>
				<DropdownMenuLabel className="text-xs text-muted-foreground">
					categories
				</DropdownMenuLabel>
				{categories
					.filter((team) => !team.hide) // Filter out hidden categories
					.map((team, index) => (
						<DropdownMenuItem
							key={team.name}
							onClick={() => {
								// Don't allow selection of disabled categories
								if (team.disabled) return;

								setActiveCategory(team);
								setActiveCategoryLocalIndex(index);
								// Update the sidebar config based on the selected category
								if (team.route === `/${PostCategory.FRONTEND}`) {
									setCurrentCategory(PostCategory.FRONTEND);
								} else if (team.route === `/${PostCategory.BACKEND}`) {
									setCurrentCategory(PostCategory.BACKEND);
								} else if (team.route === `/${PostCategory.ANDROID}`) {
									setCurrentCategory(PostCategory.ANDROID);
								}
							}}
							className={cn(
								"gap-2 p-2",
								team.disabled && "opacity-50 cursor-not-allowed",
							)}
							disabled={team.disabled}
						>
							<div className="flex items-center justify-center border rounded-sm size-6">
								<team.logo
									className={cn(
										"size-4 shrink-0",
										team.disabled && "opacity-50",
									)}
								/>
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
