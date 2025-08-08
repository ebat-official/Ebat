"use client";

import fallbackImg from "@/assets/img/avatarFallback.webp";
import { User } from "@/db/schema/zod-schemas";
import Image from "next/image";
import { truncateText } from "../shared/Lexical Editor/utils/truncateText";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SlUserFollow } from "react-icons/sl";
import { SlUserFollowing } from "react-icons/sl";
import FollowButton from "./FollowButton";
import { useSession } from "@/lib/auth-client";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "../ui/hover-card";
import AuthorProfileCard from "./AuthorProfileCard";

interface AuthorNudgeProps {
	author: Pick<
		User,
		| "id"
		| "name"
		| "companyName"
		| "image"
		| "username"
		| "karmaPoints"
		| "description"
		| "role"
		| "jobTitle"
		| "externalLinks"
	>;
	onlyAvatar?: boolean;
}

const AuthorNudge = ({ author, onlyAvatar = false }: AuthorNudgeProps) => {
	const { data: user } = useSession();

	return (
		<div className="flex items-center gap-2">
			{/* Avatar Section with Hover Card */}
			<HoverCard>
				<HoverCardTrigger asChild>
					<Avatar className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
						<AvatarImage
							src={author?.image || undefined}
							alt="avatar"
							referrerPolicy="no-referrer"
						/>
						<AvatarFallback>
							<Image
								className="rounded-full outline-hidden"
								src={fallbackImg}
								alt="author"
							/>
						</AvatarFallback>
					</Avatar>
				</HoverCardTrigger>
				<HoverCardContent className="w-auto p-0" align="start" sideOffset={8}>
					<AuthorProfileCard author={author} />
				</HoverCardContent>
			</HoverCard>

			{/* Info Section */}
			{!onlyAvatar && (
				<div className="flex flex-col justify-center flex-shrink overflow-hidden w-28">
					<div className="flex items-center gap-1">
						<span className="text-sm font-bold capitalize line-clamp-1 text-ellipsis">
							{author.name?.toLowerCase() || "Anonymous Author"}
						</span>
					</div>
					<span className="hidden sm:block text-sm opacity-80 font-medium capitalize text-ellipsis overflow-hidden text-nowrap">
						{author.companyName?.toLowerCase()}
					</span>
				</div>
			)}
		</div>
	);
};

export default AuthorNudge;
