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
		<div className="content container justify-self-center self-center">
			{children}
		</div>
	);
}
function SidePanel({ children }: { children: React.ReactNode }) {
	return (
		<div className="rightsidebar  bg-background w-full md:w-[250px] lg:w-[360px] self-start">
			{children}
		</div>
	);
}
RightPanelLayout.MainPanel = MainPanel;
RightPanelLayout.SidePanel = SidePanel;
export default RightPanelLayout;
