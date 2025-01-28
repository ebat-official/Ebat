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
		<div className="content container justify-self-center flex-1">
			{children}
		</div>
	);
}
function SidePanel({ children }: { children: React.ReactNode }) {
	return (
		<div className="rightsidebar  bg-background min-w-full md:min-w-[250px] lg:min-w-[340px] xl:min-w-[400px] self-start">
			{children}
		</div>
	);
}
RightPanelLayout.MainPanel = MainPanel;
RightPanelLayout.SidePanel = SidePanel;
export default RightPanelLayout;
