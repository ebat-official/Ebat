"use client";
import useScroll from "@/hooks/useScroll";
import ThemeSwitcher from "./ThemeSwitcher";
import UserButton from "./UserButton";
import LoginModal from "@/components/auth/LoginModal";
import { SheetMenu } from "../sidebar/sheet-menu";
import Background from "./Background";
import { cn } from "@/lib/utils";
import { type Session } from "@/lib/auth-client";

interface NavbarProps {
	session: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
	const scrolled = useScroll(50);

	return (
		<>
			<div
				className={cn(
					"sticky top-0 w-full flex justify-center  bg-white/50 dark:bg-black/0 backdrop-blur-xl transition-all",
					{
						" dark:border-gray-900 border-gray-200 border-b border-l-0 ":
							scrolled,
					},
				)}
			>
				<div className="flex items-center justify-between px-4 py-3 max-w-7xl w-full">
					<div className="flex items-center gap-2">
						<div className="lg:hidden">
							<SheetMenu />
						</div>
						<h1 className="font-bold text-xl">
							E<span className="text-orange-500">bat</span>
						</h1>
					</div>
					<div className="flex items-center gap-4">
						<ThemeSwitcher />
						{session ? <UserButton session={session} /> : <LoginModal />}
					</div>
				</div>
			</div>
			<Background />
		</>
	);
}
