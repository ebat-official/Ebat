// components/CommentActionButton.tsx
import { useState } from "react";
import { IoIosMore } from "react-icons/io";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useServerAction } from "@/hooks/useServerAction";
import { deleteComment } from "@/actions/comment";
import { SUCCESS } from "@/utils/contants";
import { toast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { useCommentContext } from "./CommentContext";

type CommentActionButtonProps = {
	commentId: string;
	postId: string;
	editModeHandler: () => void;
};

export function CommentActionButton({
	commentId,
	postId,
	editModeHandler,
}: CommentActionButtonProps) {
	const [deleteCommentAction, isLoading] = useServerAction(deleteComment);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const { deleteComment: contextDeleteCommentHandler } = useCommentContext();

	const handleDelete = async () => {
		const deleteResult = await deleteCommentAction(commentId, postId);
		if (deleteResult.status === SUCCESS) {
			toast({
				title: "Comment Deleted",
				description: "Your comment has been deleted successfully.",
				variant: "default",
			});
			setShowDeleteConfirmation(false);
			contextDeleteCommentHandler(commentId);
		} else {
			toast({
				title: "Comment Deletion Failed",
				description:
					deleteResult.data.message || "Your comment could not be deleted.",
				variant: "destructive",
			});
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<IoIosMore className="h-5 w-5" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-36">
					<DropdownMenuItem onClick={editModeHandler}>Edit</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setShowDeleteConfirmation(true)}>
						Delete
					</DropdownMenuItem>
					{/* <DropdownMenuItem onClick={handleReport}>Report</DropdownMenuItem> */}
				</DropdownMenuContent>
			</DropdownMenu>

			{showDeleteConfirmation && (
				<DeleteConfirmationDialog
					onDelete={handleDelete}
					isLoading={isLoading}
					onCancel={() => setShowDeleteConfirmation(false)}
				/>
			)}
		</>
	);
}
