import React, { FC } from "react";
import { Card, CardContent } from "../ui/card";
import { TbTriangle } from "react-icons/tb";
import { formatNumInK } from "@/utils/formatNumInK";

interface PostLikeButtonProps {
	count: number;
}

export const PostLikeDummyButton: FC<PostLikeButtonProps> = ({ count }) => {
	return (
		<Card className="flex  py-0 w-fit">
			<CardContent className=" flex justify-center items-center py-1 px-2 gap-2">
				<button type="button" disabled>
					<TbTriangle size={12} />
				</button>
				<span className="text-xs">{formatNumInK(count)}</span>
				<button type="button" disabled className="rotate-180">
					<TbTriangle size={12} />
				</button>
			</CardContent>
		</Card>
	);
};
