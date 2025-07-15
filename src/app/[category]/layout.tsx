import Background from "@/components/shared/Background";
import SidePanelLayout from "@/components/sidebar/panelLayout";
import { SidebarProvider } from "@/context/SidebarContext";

export default function SidebarLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SidebarProvider>
			<SidePanelLayout>{children}</SidePanelLayout>
			<Background />
		</SidebarProvider>
	);
}
