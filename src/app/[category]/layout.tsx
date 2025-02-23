import Background from "@/components/shared/Background";
import { SidebarProvider } from "@/context/SidebarContext";
import SidePanelLayout from "@/components/sidebar/panelLayout";

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
