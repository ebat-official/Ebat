"use client";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

export default function SidePanelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const sidebar = useSidebar();
	if (!sidebar) return null;
	const { getOpenState, settings } = sidebar;
	return (
		<>
			<Sidebar />
			<main
				className={cn(
					"min-h-[calc(100vh_-_56px)] transition-[margin-left] ease-in-out duration-300",
					!settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72"),
				)}
			>
				{children}
			</main>
		</>
	);
}
