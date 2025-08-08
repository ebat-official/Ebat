import fallbackImg from "@/assets/img/avatarFallback.webp";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Session, signOut } from "@/lib/auth-client";
import Image from "next/image";
import React, { FC } from "react";
import { USER_MENU_LINKS } from "@/config";
import { FaYinYang } from "react-icons/fa";
import { useProgress } from "react-transition-progress";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { formatNumInK } from "@/utils/formatNumInK";

interface UserButtonProps {
	session: Session | null;
}

import {
	LogOut,
	User,
	Bookmark,
	FileText,
	Settings,
	Star,
	Users,
	Keyboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	// DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	// DropdownMenuSub,
	// DropdownMenuSubContent,
	// DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserButton: FC<UserButtonProps> = ({ session }) => {
	const userFirstLetter = session?.user?.name?.charAt(0).toUpperCase();
	const startProgress = useProgress();
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
	};

	const handleNavigation = (href: string) => {
		startTransition(async () => {
			startProgress();
			router.push(href);
		});
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						className="rounded-full select-none focus-visible:ring-0 w-9 h-9 relative"
						variant="ghost"
						size="icon"
					>
						<Avatar>
							<AvatarImage
								src={session?.user?.image || undefined}
								alt="avatar"
								referrerPolicy="no-referrer"
							/>
							<AvatarFallback>
								{userFirstLetter ? (
									userFirstLetter
								) : (
									<Image
										className="rounded-full outline-hidden"
										src={fallbackImg}
										alt="AB"
									/>
								)}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="start">
					{/* Karma Display - Not clickable */}
					<div className="px-2 py-1.5 text-sm">
						<div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/50">
							<div className="flex items-center gap-2 py-1">
								<FaYinYang className="w-4 h-4 text-muted-foreground" />
								<span className="text-muted-foreground">Karma</span>
							</div>
							<span className="font-semibold text-foreground">
								{formatNumInK(
									(session?.user as { karmaPoints?: number })?.karmaPoints || 0,
								)}
							</span>
						</div>
					</div>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem
							onClick={() => handleNavigation(USER_MENU_LINKS.ACCOUNT)}
						>
							<User className="w-4 h-4 mr-2" />
							<span>Profile</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleNavigation(USER_MENU_LINKS.POSTS)}
						>
							<FileText className="w-4 h-4 mr-2" />
							<span>My Posts</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleNavigation(USER_MENU_LINKS.BOOKMARKS)}
						>
							<Bookmark className="w-4 h-4 mr-2" />
							<span>Bookmarks</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleNavigation(USER_MENU_LINKS.APPROVALS)}
						>
							<Users className="w-4 h-4 mr-2" />
							<span>Approvals</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleSignOut}>
						<LogOut className="w-4 h-4 mr-2" />
						<span>Log out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

export default UserButton;
