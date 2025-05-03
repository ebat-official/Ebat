// components/CommentActionButton.tsx
import { IoIosMore } from "react-icons/io";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CommentActionButtonProps = {
	commentId: string;
	editModeHandler: () => void;
};

export function CommentActionButton({
	commentId,
	editModeHandler,
}: CommentActionButtonProps) {
	const handleDelete = () => {
		console.log(`Delete comment ${commentId}`);
		// Future: call delete action here
	};

	const handleReport = () => {
		console.log(`Report comment ${commentId}`);
		// Future: call report action here
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<IoIosMore className="h-5 w-5" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-36">
				<DropdownMenuItem onClick={editModeHandler}>Edit</DropdownMenuItem>
				<DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
				<DropdownMenuItem onClick={handleReport}>Report</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
