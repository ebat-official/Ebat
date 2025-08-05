import { toast } from "sonner";
import { KarmaAction, PostType, VoteType } from "@/db/schema/enums";
import { KarmaMetadata } from "@/types/karma";

interface KarmaNotificationProps {
	action: KarmaAction;
	karmaChange: number;
	metadata: KarmaMetadata;
}

export const showKarmaNotification = ({
	action,
	karmaChange,
	metadata,
}: KarmaNotificationProps) => {
	const isPositive = karmaChange > 0;
	const isNegative = karmaChange < 0;

	let title = "";
	let description = "";

	switch (action) {
		case KarmaAction.POST_APPROVAL: {
			const postTitle = metadata.postTitle;
			const isApprover = metadata.isApprover;
			if (isApprover) {
				title = `Post Approval! +${karmaChange} karma`;
				description = `You approved "${postTitle || "a post"}"`;
			} else {
				title = `Post Approved! +${karmaChange} karma`;
				description = `Your post "${postTitle || "unknown"}" was approved`;
			}
			break;
		}
		case KarmaAction.POST_EDIT_APPROVAL: {
			const postTitle = metadata.postTitle;
			const isApprover = metadata.isApprover;
			if (isApprover) {
				title = `Edit Approval! +${karmaChange} karma`;
				description = `You approved an edit to "${postTitle || "a post"}"`;
			} else {
				title = `Edit Approved! +${karmaChange} karma`;
				description = `Your edit to "${postTitle || "a post"}" was approved`;
			}
			break;
		}
		case KarmaAction.POST_VOTE: {
			if (metadata.voteType === VoteType.UP) {
				title = `Post Upvoted! +${karmaChange} karma`;
				description = "Someone upvoted your post";
			} else {
				title = `Post Downvoted! ${karmaChange} karma`;
				description = "Someone downvoted your post";
			}
			break;
		}
		case KarmaAction.COMMENT_VOTE: {
			if (metadata.voteType === VoteType.UP) {
				title = `Comment Upvoted! +${karmaChange} karma`;
				description = "Someone upvoted your comment";
			} else {
				title = `Comment Downvoted! ${karmaChange} karma`;
				description = "Someone downvoted your comment";
			}
			break;
		}
		case KarmaAction.POST_VOTE_REMOVAL:
		case KarmaAction.COMMENT_VOTE_REMOVAL: {
			title = `Vote Removed! ${karmaChange} karma`;
			description = "A vote on your content was removed";
			break;
		}
		default:
			title = `Karma ${isPositive ? "Gained" : "Lost"}! ${karmaChange}`;
			description = "Your karma has changed";
	}

	toast(title, {
		description,
		action: {
			label: "View History",
			onClick: () => {
				// Navigate to karma history page
				window.location.href = "/settings/karma";
			},
		},
		className: isPositive
			? "border-green-500"
			: isNegative
				? "border-red-500"
				: "",
	});
};
