"use client";
import useScroll from "@/hooks/useScroll";
import ThemeSwitcher from "./ThemeSwitcher";
import UserButton from "./UserButton";
import LoginModal from "@/components/auth/LoginModal";
import { SheetMenu } from "../sidebar/sheet-menu";
import Background from "./Background";
import { cn } from "@/lib/utils";

// BetterAuth session type
type BetterAuthSession = {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
		emailVerified: boolean;
		createdAt: Date;
		updatedAt: Date;
	};
	session: {
		id: string;
		token: string;
		userId: string;
		expiresAt: Date;
		createdAt: Date;
		updatedAt: Date;
		ipAddress?: string | null;
		userAgent?: string | null;
	};
};

export default function NavBar({
	session,
}: { session: BetterAuthSession | null }) {
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
				<div className="flex items-center justify-between w-full h-16  mx-5">
					<div>
						<SheetMenu />
					</div>
					<div className="flex gap-4 absolute right-16">
						<ThemeSwitcher />

						{session ? (
							<UserButton session={session} />
						) : (
							<LoginModal dialogTrigger />
						)}
					</div>
				</div>
				<Background shadow={false} />
			</div>
		</>
	);
}
