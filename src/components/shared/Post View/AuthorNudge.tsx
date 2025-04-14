import fallbackImg from "@/assets/img/avatarFallback.webp";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import Image from "next/image";
import { UserProfile } from "@prisma/client";
import { truncateText } from "../Lexical Editor/utils/truncateText";

const AuthorNudge = ({
	author,
}: {
	author: Pick<UserProfile, "name" | "companyName" | "image">;
}) => {
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

			<div className="flex flex-col justify-center flex-shrink overflow-hidden">
				<span className="text-sm font-bold capitalize ">
					{truncateText(author.name?.split(" ")[0] || "", 10)?.toLowerCase() ||
						"Anonymous Author"}
				</span>
				<span className="hidden sm:block text-sm opacity-80 font-medium capitalize">
					{truncateText(author.companyName || "", 30)?.toLowerCase()}
				</span>
			</div>
		</div>
	);
};

export default AuthorNudge;
