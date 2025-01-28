"use client";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import Nav from "../shared/nav";

export default function SidePanelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const sidebar = useSidebar();
	if (!sidebar) return null;
	const { getOpenState, settings } = sidebar;
	return (
		<div className="flex">
			<Sidebar />
			<div
				className={cn(
					"min-h-[calc(100vh_-_56px)] transition-[margin-left] ease-in-out duration-300 flex-1",
					// !settings.disabled &&
					// 	(!getOpenState() ? "lg:ml-[90px] xl:ml-0" : "lg:ml-72 xl:ml-0"),
				)}
			>
				<Nav />
				<main>{children}</main>
			</div>
		</div>
	);
}
