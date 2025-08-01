"use client";

import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-transition-progress/next";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		href: string;
		title: string;
	}[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
	const pathname = usePathname();

	return (
		<nav
			className={cn(
				"flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
				className,
			)}
			{...props}
		>
			{items.map((item) => {
				const isActive = pathname === item.href;
				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							buttonVariants({ variant: "ghost" }),
							isActive
								? "bg-muted hover:bg-muted"
								: "hover:bg-transparent hover:underline",
							"justify-start",
						)}
					>
						{item.title}
					</Link>
				);
			})}
		</nav>
	);
}
