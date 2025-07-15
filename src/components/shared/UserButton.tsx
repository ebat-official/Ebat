import fallbackImg from "@/assets/img/avatarFallback.webp";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Session, signOut } from "@/lib/auth-client";
import Image from "next/image";
import React, { FC } from "react";

interface UserButtonProps {
	session: Session | null;
}

import {
	LogOut,
	// UserPlus,
	// Users,
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

	const handleSignOut = async () => {
		await signOut();
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						className="rounded-full select-none focus-visible:ring-0 w-9 h-9"
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
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						{/* <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="w-4 h-4 mr-2" />
              <span>Billing</span>
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="w-4 h-4 mr-2" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator /> */}
						<DropdownMenuItem onClick={handleSignOut}>
							<LogOut className="w-4 h-4 mr-2" />
							<Button className="h-0" variant="ghost">
								Log out
							</Button>
							<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
						</DropdownMenuItem>

						{/* <DropdownMenuItem>
              <Keyboard className="w-4 h-4 mr-2" />
              <span>Keyboard shortcuts</span>
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem> */}
					</DropdownMenuGroup>
					{/* <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Users className="w-4 h-4 mr-2" />
              <span>Team</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <UserPlus className="w-4 h-4 mr-2" />
                <span>Invite users</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" />
                    <span>Email</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <span>Message</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    <span>More...</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem>
              <Plus className="w-4 h-4 mr-2" />
              <span>New Team</span>
              <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Github className="w-4 h-4 mr-2" />
            <span>GitHub</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            <Cloud className="w-4 h-4 mr-2" />
            <span>API</span>
          </DropdownMenuItem> */}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

export default UserButton;
