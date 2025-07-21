import fallbackImg from "@/assets/img/avatarFallback.webp";
import { User } from "@/db/schema/zod-schemas";
import Image from "next/image";
import { truncateText } from "../shared/Lexical Editor/utils/truncateText";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SlUserFollow } from "react-icons/sl";
import { SlUserFollowing } from "react-icons/sl";
import FollowButton from "./FollowButton";
import { useSession } from "@/lib/auth-client";
import { validateUser } from "@/actions/user";

interface AuthorNudgeProps {
	author: Pick<User, "id" | "name" | "companyName" | "image">;
	onlyAvatar?: boolean;
}

const AuthorNudge = async ({
	author,
	onlyAvatar = false,
}: AuthorNudgeProps) => {
	const user = await validateUser();
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
					<div className="flex items-center gap-1">
						<span className="text-sm font-bold capitalize line-clamp-1 text-ellipsis">
							{author.name?.toLowerCase() || "Anonymous Author"}
						</span>
						{user?.id !== author.id && <FollowButton authorId={author.id} />}
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
