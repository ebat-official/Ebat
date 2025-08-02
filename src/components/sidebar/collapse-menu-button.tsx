"use client";

import { ChevronDown, LucideIcon, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconTypes, Submenu } from "@/lib/sidebarConfig";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Link } from "react-transition-progress/next";

interface CollapseMenuButtonProps {
	icon: IconTypes;
	label: string;
	active: boolean;
	submenus: Submenu[];
	isOpen: boolean | undefined;
	disabled?: boolean;
	hide?: boolean;
}

export function CollapseMenuButton({
	icon: Icon,
	label,
	active,
	submenus,
	isOpen,
	disabled,
	hide,
}: CollapseMenuButtonProps) {
	// Skip rendering if item is hidden
	if (hide) return null;

	const pathname = usePathname();
	const isSubmenuActive = submenus.some((submenu) =>
		submenu.active === undefined ? submenu.href === pathname : submenu.active,
	);
	const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive);

	return isOpen ? (
		<Collapsible
			open={isCollapsed}
			onOpenChange={setIsCollapsed}
			className="w-full"
		>
			<CollapsibleTrigger
				className="[&[data-state=open]>div>div>svg]:rotate-180 mb-1"
				asChild
			>
				<Button
					variant={isSubmenuActive ? "secondary" : "ghost"}
					className="w-full justify-start h-10"
				>
					<div className="w-full items-center flex justify-between">
						<div className="flex items-center">
							<span className="mr-4">
								<Icon size={18} />
							</span>
							<p
								className={cn(
									"max-w-[150px] truncate",
									isOpen
										? "translate-x-0 opacity-100"
										: "-translate-x-96 opacity-0",
								)}
							>
								{label}
							</p>
						</div>
						<div
							className={cn(
								"whitespace-nowrap",
								isOpen
									? "translate-x-0 opacity-100"
									: "-translate-x-96 opacity-0",
							)}
						>
							<ChevronDown
								size={18}
								className="transition-transform duration-200"
							/>
						</div>
					</div>
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className=" relative overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
				{submenus.map(
					({ href, label, active, disabled, hide, createHref }, index) => {
						// Skip rendering if submenu item is hidden
						if (hide) return null;

						return (
							<div key={index} className="group relative">
								<Button
									variant={
										(active === undefined && pathname === href) || active
											? "secondary"
											: "ghost"
									}
									className="w-full justify-start h-10 mb-1 ml-8 mr-2"
									disabled={disabled}
									asChild={!disabled}
								>
									{disabled ? (
										<div className="relative">
											<p
												className={cn(
													"max-w-[170px] truncate",
													isOpen
														? "translate-x-0 opacity-100"
														: "-translate-x-96 opacity-0",
												)}
											>
												{label}
											</p>
											<div className="absolute left-0 top-1/4 -translate-x-full w-3 h-3 bg-transparent border-b-[1px] border-zinc-400 rounded-b-sm" />
										</div>
									) : (
										<Link href={href} className="relative">
											<p
												className={cn(
													"max-w-[170px] truncate",
													isOpen
														? "translate-x-0 opacity-100"
														: "-translate-x-96 opacity-0",
												)}
											>
												{label}
											</p>
											<div className="absolute left-0 top-1/4 -translate-x-full w-3 h-3 bg-transparent border-b-[1px] border-zinc-400 rounded-b-sm" />
										</Link>
									)}
								</Button>
								{/* Create button that appears on hover */}
								{createHref && (
									<Button
										size="sm"
										variant="ghost"
										className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 rounded-full shadow-sm"
										asChild
										title="Create new"
									>
										<Link href={createHref}>
											<Plus size={12} className="text-white" />
										</Link>
									</Button>
								)}
							</div>
						);
					},
				)}
				<div className="h-[90%] w-[1px] bg-zinc-400 absolute left-5 top-0" />
			</CollapsibleContent>
		</Collapsible>
	) : (
		<DropdownMenu>
			<TooltipProvider disableHoverableContent>
				<Tooltip delayDuration={100}>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button
								variant={isSubmenuActive ? "secondary" : "ghost"}
								className="w-full justify-start h-10 mb-1"
							>
								<div className="w-full items-center flex justify-between">
									<div className="flex items-center">
										<span className={cn(isOpen === false ? "" : "mr-4")}>
											<Icon size={18} />
										</span>
										<p
											className={cn(
												"max-w-[200px] truncate",
												isOpen === false ? "opacity-0" : "opacity-100",
											)}
										>
											{label}
										</p>
									</div>
								</div>
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent side="right" align="start" alignOffset={2}>
						{label}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<DropdownMenuContent side="right" sideOffset={25} align="start">
				<DropdownMenuLabel className="max-w-[190px] truncate">
					{label}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{submenus.map(
					({ href, label, active, disabled, hide, createHref }, index) => {
						// Skip rendering if submenu item is hidden
						if (hide) return null;

						return (
							<div key={index} className="group relative">
								<DropdownMenuItem asChild disabled={disabled}>
									{disabled ? (
										<div className="cursor-not-allowed">
											<p className="max-w-[180px] truncate">{label}</p>
										</div>
									) : (
										<Link
											className={`cursor-pointer ${
												((active === undefined && pathname === href) ||
													active) &&
												"bg-secondary"
											}`}
											href={href}
										>
											<p className="max-w-[180px] truncate">{label}</p>
										</Link>
									)}
								</DropdownMenuItem>
								{/* Create button that appears on hover */}
								{createHref && (
									<DropdownMenuItem asChild>
										<Link
											href={createHref}
											className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-blue-500 text-white px-1 rounded"
										>
											<Plus size={12} />
										</Link>
									</DropdownMenuItem>
								)}
							</div>
						);
					},
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
