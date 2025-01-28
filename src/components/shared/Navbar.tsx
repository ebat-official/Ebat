"use client";
import useScroll from "@/hooks/useScroll";
import ThemeSwitcher from "./ThemeSwitcher";
import UserButton from "./UserButton";
import type { Session } from "next-auth";
import LoginModal from "@/components/auth/LoginModal";
import { SheetMenu } from "../sidebar/sheet-menu";
import Background from "./Background";
import { cn } from "@/lib/utils";

export default function NavBar({ session }: { session: Session | null }) {
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
				<div className="flex items-center justify-between w-full h-16 max-w-screen-xl mx-5">
					<div>
						<SheetMenu />
					</div>
					<div className="flex gap-4 absolute right-16">
						<ThemeSwitcher />

						{session ? <UserButton session={session} /> : <LoginModal />}
					</div>
				</div>
				<Background shadow={false} />
			</div>
		</>
	);
}
