import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type DeleteConfirmationDialogProps = {
	onDelete: () => void;
	isLoading?: boolean;
	title?: string;
	description?: string;
	onCancel?: () => void; // Optional callback for cancel action
};

export function DeleteConfirmationDialog({
	onDelete,
	isLoading = false,
	title = "Delete comment",
	description = "Are you sure you want to delete this comment?",
	onCancel,
}: DeleteConfirmationDialogProps) {
	return (
		<AlertDialog open>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							variant="destructive"
							onClick={onDelete}
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="animate-spin mr-2" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
