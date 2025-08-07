import { Button } from "@/components/ui/button";
import StatusDialog from "@/components/shared/StatusDialog";
import { useProgress } from "react-transition-progress";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

interface PostErrorDialogProps {
	blockUserAccess: {
		message?: string;
		title?: string;
	} | null;
}

export default function PostErrorDialog({
	blockUserAccess,
}: PostErrorDialogProps) {
	const router = useRouter();
	const startProgress = useProgress();

	if (!blockUserAccess) return null;

	return (
		<StatusDialog type="error">
			<StatusDialog.Title>{blockUserAccess?.title}</StatusDialog.Title>
			<StatusDialog.Content>{blockUserAccess?.message}</StatusDialog.Content>
			<StatusDialog.Footer>
				<Button
					className="w-[90%] blue-gradient text-white"
					onClick={() => {
						startTransition(async () => {
							startProgress();
							router.push("/");
						});
					}}
				>
					Go back to home
				</Button>
			</StatusDialog.Footer>
		</StatusDialog>
	);
}
