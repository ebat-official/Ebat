import { Metadata } from "next";
import Image from "next/image";

import { validateUser } from "@/actions/user";
import { SidebarNav } from "@/components/settings";
import Background from "@/components/shared/Background";
import SidePanelLayout from "@/components/sidebar/panelLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserRole } from "@/db/schema/enums";

export const metadata: Metadata = {
	title: "Forms",
	description: "Advanced form example using react-hook-form and Zod.",
};

interface SettingsLayoutProps {
	children: React.ReactNode;
}

async function SettingsLayout({ children }: SettingsLayoutProps) {
	const user = await validateUser();
	const userRole = user?.role;
	const isAdmin = userRole === UserRole.ADMIN;
	const sidebarNavItems = [
		{
			title: "Profile",
			href: "/settings",
		},
		{
			title: "Account",
			href: "/settings/account",
		},
		{
			title: "Appearance",
			href: "/settings/appearance",
		},
		{
			title: "Notifications",
			href: "/settings/notifications",
		},
		{
			title: "Display",
			href: "/settings/display",
		},
		// Only show admin tab for admin users
		...(isAdmin
			? [
					{
						title: "Admin",
						href: "/settings/admin",
					},
				]
			: []),
	];

	return (
		<Card className="m-2 bg-transparent">
			<CardContent>
				<div className="md:hidden">
					<Image
						src=""
						width={1280}
						height={791}
						alt="Forms"
						className="block dark:hidden"
					/>
					<Image
						src=""
						width={1280}
						height={791}
						alt="Forms"
						className="hidden dark:block"
					/>
				</div>
				<div className="hidden space-y-6 p-10 pb-16 md:block">
					<div className="space-y-0.5">
						<h2 className="text-2xl font-bold tracking-tight">Settings</h2>
						<p className="text-muted-foreground">
							Manage your account settings and set e-mail preferences.
						</p>
					</div>
					<Separator className="my-6" />
					<div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 ">
						<aside className=" lg:w-1/5">
							<SidebarNav items={sidebarNavItems} />
						</aside>
						<div className="flex-1  bg-card/50 p-4 rounded-md">{children}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function SidebarLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SidebarProvider>
			<SidePanelLayout>
				<SettingsLayout>{children}</SettingsLayout>
			</SidePanelLayout>
			<Background />
		</SidebarProvider>
	);
}
