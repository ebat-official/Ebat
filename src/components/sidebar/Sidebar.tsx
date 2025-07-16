"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { useMobileSidebar } from "@/utils/routeUtils";
import { PanelsTopLeft } from "lucide-react";
import { Link } from "react-transition-progress/next";
import { CategorySwitcher } from "./CategorySwitcher";
import { Menu } from "./menu";
import { SidebarToggle } from "./sidebar-toggle";

import { FaReact } from "react-icons/fa";
import { Navigation } from "./Navigation";

export function Sidebar() {
	const sidebar = useSidebar();
	if (!sidebar) return null;

	const { isOpen, toggleOpen, getOpenState, setIsHover, settings, mobileNav } =
		sidebar;

	// Hide sidebar for specific routes
	const shouldHideForRoute = useMobileSidebar();

	// Combine mobile nav and route-based hiding
	const shouldHideSidebar = mobileNav || shouldHideForRoute;

	return (
		<aside
			className={cn(
				"font-inter  fixed lg:sticky top-0 left-0 z-20 h-screen  -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
				!getOpenState() ? "w-[90px]" : "w-72",
				settings.disabled && "hidden",
				{ "!-translate-x-full !fixed": shouldHideSidebar },
			)}
		>
			<SidebarToggle
				isOpen={isOpen}
				setIsOpen={toggleOpen}
				className={cn(
					"invisible lg:visible absolute top-[112px] -right-[16px] z-20",
					{ "!invisible": shouldHideSidebar },
				)}
			/>
			<div
				onMouseEnter={() => setIsHover(true)}
				onMouseLeave={() => setIsHover(false)}
				className="relative gap-2 justify-between  flex flex-col px-3 py-4 shadow-md dark:shadow-zinc-800"
			>
				<CategorySwitcher />
				<Navigation isOpen={getOpenState()} />
				<Menu isOpen={getOpenState()} />
			</div>
		</aside>
	);
}
