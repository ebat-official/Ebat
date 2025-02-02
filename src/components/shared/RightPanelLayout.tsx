import { cn } from "@/lib/utils";
import React from "react";

function RightPanelLayout({
	children,
	className,
}: { children: React.ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"flex-col md:flex-row flex w-full gap-2 justify-around p-2",
				className,
			)}
		>
			{children}
		</div>
	);
}
function MainPanel({
	children,
	className,
}: { children: React.ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"content md:container justify-self-center flex-1",
				className,
			)}
		>
			{children}
		</div>
	);
}
function SidePanel({
	children,
	className,
}: { children: React.ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"rightsidebar  bg-background w-full md:w-[340px] xl:w-[400px] self-start",
				className,
			)}
		>
			{children}
		</div>
	);
}
RightPanelLayout.MainPanel = MainPanel;
RightPanelLayout.SidePanel = SidePanel;
export default RightPanelLayout;
