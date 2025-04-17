"use client";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { FaRegCommentDots } from "react-icons/fa";
import { SerializedEditorState } from "lexical";
import { MentionData } from "../shared/Lexical Editor/plugins/MentionPlugin/MentionChangePlugin";
const Editor = dynamic(() => import("./CommentEditor"), {
	ssr: false,
	loading: () => <Skeleton className="w-full mt-8 h-9" />,
});

interface CommentEditBoxProps {
	content?: string;
	parentId?: string | null;
}

export default function CommentEditBox({
	content,
	parentId = null,
}: CommentEditBoxProps) {
	const [comment, setComment] = useState<SerializedEditorState>();
	const [mentions, setMentions] = useState<MentionData[]>([]);

	const actionSavingLoading = false;
	console.log(comment, mentions);
	return (
		<div>
			<Card className=" pb-2 px-2 ">
				<CardContent className="pl-2 px-0 relative">
					<Editor
						onChangeHandler={setComment}
						onMentionChangeHandler={setMentions}
					/>
					<Button
						disabled={false}
						onClick={() => null}
						variant="outline"
						className="rounded-full absolute right-0 bottom-0"
					>
						{actionSavingLoading ? (
							<Loader2 className="animate-spin" />
						) : (
							<FaRegCommentDots />
						)}
						<span className="hidden md:block font-semibold ">Comment</span>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
