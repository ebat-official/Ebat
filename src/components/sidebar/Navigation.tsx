"use client";

import { useSession } from "@/lib/auth-client";
import { useAuthAction } from "@/hooks/useAuthAction";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconTypes } from "@/lib/sidebarConfig";
import { useSidebar } from "@/context/SidebarContext";
import { Link } from "react-transition-progress/next";
import { useProgress } from "react-transition-progress";
import { startTransition } from "react";

interface NavigationProps {
	isOpen: boolean | undefined;
}

export function Navigation({ isOpen }: NavigationProps) {
	const { config } = useSidebar();
	const { navigation } = config;
	const { data: session } = useSession();
	const pathname = usePathname();
	const router = useRouter();
	const startProgress = useProgress();

	const { executeAction, renderLoginModal } = useAuthAction({
		requireAuth: true,
		authMessage: "Please sign in to access your profile",
		onSuccess: () => {
			// Navigate to profile after successful login
			startTransition(async () => {
				startProgress();
				router.push("/settings/profile");
			});
		},
	});

	const handleProfileClick = (href: string) => {
		if (href === "/settings/profile") {
			// If user is already authenticated, navigate directly
			if (session) {
				startTransition(async () => {
					startProgress();
					router.push(href);
				});
			} else {
				// Show login modal for unauthenticated users
				executeAction(() => {
					// This will be executed after successful authentication
					startTransition(async () => {
						startProgress();
						router.push(href);
					});
				});
			}
		} else {
			// For other navigation items, navigate directly
			startTransition(async () => {
				startProgress();
				router.push(href);
			});
		}
	};

	return (
		<>
			{navigation.map(({ groupLabel, menus }, groupIndex) => (
				<div key={groupIndex} className="w-full">
					{groupLabel && (
						<p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
							{groupLabel}
						</p>
					)}
					{menus.map(({ href, label, icon: Icon, disabled, hide }, index) => {
						// Skip rendering if item is hidden
						if (hide) return null;

						const isActive = pathname === href;
						const isProfile = href === "/settings/profile";

						return (
							<div key={index} className="w-full">
								{isProfile ? (
									<Button
										variant={isActive ? "secondary" : "ghost"}
										className="w-full justify-start h-10 mb-1"
										disabled={disabled}
										onClick={() => handleProfileClick(href)}
									>
										<span className={cn(isOpen === false ? "" : "mr-4")}>
											<Icon size={18} />
										</span>
										<p
											className={cn(
												"max-w-[200px] truncate",
												isOpen === false
													? "-translate-x-96 opacity-0"
													: "translate-x-0 opacity-100",
											)}
										>
											{label}
										</p>
									</Button>
								) : (
									<Button
										variant={isActive ? "secondary" : "ghost"}
										className="w-full justify-start h-10 mb-1"
										disabled={disabled}
										asChild={!disabled}
									>
										{disabled ? (
											<div className="flex items-center w-full">
												<span className={cn(isOpen === false ? "" : "mr-4")}>
													<Icon size={18} />
												</span>
												<p
													className={cn(
														"max-w-[200px] truncate",
														isOpen === false
															? "-translate-x-96 opacity-0"
															: "translate-x-0 opacity-100",
													)}
												>
													{label}
												</p>
											</div>
										) : (
											<Link href={href}>
												<span className={cn(isOpen === false ? "" : "mr-4")}>
													<Icon size={18} />
												</span>
												<p
													className={cn(
														"max-w-[200px] truncate",
														isOpen === false
															? "-translate-x-96 opacity-0"
															: "translate-x-0 opacity-100",
													)}
												>
													{label}
												</p>
											</Link>
										)}
									</Button>
								)}
							</div>
						);
					})}
				</div>
			))}
			{renderLoginModal()}
		</>
	);
}
