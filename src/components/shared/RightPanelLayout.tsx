import React from "react";

function RightPanelLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex-col md:flex-row flex w-full gap-2 justify-around p-2">
			{children}
		</div>
	);
}
function MainPanel({ children }: { children: React.ReactNode }) {
	return (
		<div className="content md:container justify-self-center flex-1">
			{children}
		</div>
	);
}
function SidePanel({ children }: { children: React.ReactNode }) {
	return (
		<div className="rightsidebar  bg-background w-full md:w-[250px] lg:w-[340px] xl:w-[400px] self-start">
			{children}
		</div>
	);
}
RightPanelLayout.MainPanel = MainPanel;
RightPanelLayout.SidePanel = SidePanel;
export default RightPanelLayout;
