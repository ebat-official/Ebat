import { CommentWithVotes } from "@/utils/types";
import { CommentViewBox } from "./CommentViewBox";

interface CommentListProps {
	comments: CommentWithVotes[];
	postId: string;
}

export function CommentList({ comments, postId }: CommentListProps) {
	return (
		<div className="space-y-4">
			{comments.map((comment) => (
				<CommentViewBox key={comment.id} comment={comment} postId={postId} />
			))}
		</div>
	);
}
