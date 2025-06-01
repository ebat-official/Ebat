import fallbackImg from "@/assets/img/avatarFallback.webp";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { UserProfile } from "@prisma/client";
import { truncateText } from "../shared/Lexical Editor/utils/truncateText";

interface AuthorNudgeProps {
	author: Pick<UserProfile, "name" | "companyName" | "image">;
	onlyAvatar?: boolean;
}

const AuthorNudge = ({ author, onlyAvatar = false }: AuthorNudgeProps) => {
	return (
		<div className="flex items-center gap-2">
			{/* Avatar Section */}
			<Avatar className="flex-shrink-0">
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

			{/* Info Section */}
			{!onlyAvatar && (
				<div className="flex flex-col justify-center flex-shrink overflow-hidden w-28">
					<span className="text-sm font-bold capitalize line-clamp-1 text-ellipsis">
						{author.name?.toLowerCase() || "Anonymous Author"}
					</span>
					<span className="hidden sm:block text-sm opacity-80 font-medium capitalize text-ellipsis overflow-hidden text-nowrap">
						{author.companyName?.toLowerCase()}
					</span>
				</div>
			)}
		</div>
	);
};

export default AuthorNudge;
