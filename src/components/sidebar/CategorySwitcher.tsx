"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";


export function CategorySwitcher({
	categories,
}: {
	categories: {
		name: string;
		logo: React.ElementType;
		plan?: string;
		logoClassName?: string;
		route: string;
	}[];
}) {
	const { isMobile } = useSidebar();
	const router = useRouter();
	const pathname = usePathname();
	const [activeCategoryLocalIndex, setActiveCategoryLocalIndex] = useLocalStorage<number>('categoryIndex',0);
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
        const key = event.code ;
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
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							variant="outline"
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Card className="flex items-center gap-2 p-1 mr-4 rounded-lg">
								<activeCategory.logo
									className={cn("size-6", activeCategory.logoClassName)}
								/>
							</Card>
							<div className="grid flex-1 text-base leading-tight text-left">
								<span className="font-semibold truncate">
									{activeCategory.name}
								</span>
								<span className="text-xs truncate">{activeCategory.plan}</span>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
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
									setActiveCategory(team)
									setActiveCategoryLocalIndex(index)
								}
							}
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
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
