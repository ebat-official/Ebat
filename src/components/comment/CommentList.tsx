import { CommentWithVotes } from "@/utils/types";
import { CommentViewBox } from "./CommentViewBox";

interface CommentListProps {
	comments: CommentWithVotes[];
}

export function CommentList({ comments }: CommentListProps) {
	return (
		<div className="space-y-4">
			{comments.map((comment) => (
				<CommentViewBox key={comment.id} comment={comment} />
			))}
		</div>
	);
}
