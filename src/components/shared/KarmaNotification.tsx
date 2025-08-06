import { toast } from "sonner";
import {
	KarmaAction,
	PostType,
	VoteType,
	PostCategory,
	SubCategory,
} from "@/db/schema/enums";
import { KarmaMetadata } from "@/types/karma";
import { generatePostPath } from "@/utils/generatePostPath";

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
	let postUrl = "";

	// Generate post URL if we have the required metadata
	if (
		metadata.postId &&
		metadata.category &&
		metadata.subCategory &&
		metadata.slug &&
		metadata.postType
	) {
		postUrl = generatePostPath({
			category: metadata.category as PostCategory,
			subCategory: metadata.subCategory as SubCategory,
			slug: metadata.slug,
			id: metadata.postId,
			postType: metadata.postType as PostType,
		});
	}

	switch (action) {
		case KarmaAction.POST_APPROVAL: {
			const postTitle = metadata.postTitle;
			const isApprover = metadata.isApprover;
			if (isApprover) {
				title = `Post Approval! +${karmaChange} karma`;
				description = `You approved ${postTitle || "a post"}`;
			} else {
				title = `Post Approved! +${karmaChange} karma`;
				description = `Your post ${postTitle || "unknown"} was approved`;
			}
			break;
		}
		case KarmaAction.POST_EDIT_APPROVAL: {
			const postTitle = metadata.postTitle;
			const isApprover = metadata.isApprover;
			if (isApprover) {
				title = `Edit Approval! +${karmaChange} karma`;
				description = `You approved an edit to ${postTitle || "a post"}`;
			} else {
				title = `Edit Approved! +${karmaChange} karma`;
				description = `Your edit to ${postTitle || "a post"} was approved`;
			}
			break;
		}
		case KarmaAction.POST_VOTE: {
			const postTitle = metadata.postTitle;
			const voteType = metadata.voteType;
			const actionText = voteType === VoteType.UP ? "upvoted" : "downvoted";
			title = `Post ${voteType === VoteType.UP ? "Upvoted" : "Downvoted"}! ${karmaChange > 0 ? "+" : ""}${karmaChange} karma`;
			description = `Someone ${actionText} your post ${postTitle || "unknown"}`;
			break;
		}
		case KarmaAction.COMMENT_VOTE: {
			const voteType = metadata.voteType;
			const actionText = voteType === VoteType.UP ? "upvoted" : "downvoted";
			title = `Comment ${voteType === VoteType.UP ? "Upvoted" : "Downvoted"}! ${karmaChange > 0 ? "+" : ""}${karmaChange} karma`;
			description = `Someone ${actionText} your comment`;
			break;
		}
		case KarmaAction.POST_VOTE_REMOVAL: {
			const postTitle = metadata.postTitle;
			title = `Vote Removed! ${karmaChange > 0 ? "+" : ""}${karmaChange} karma`;
			description = `Someone removed their vote on your post ${postTitle || "unknown"}`;
			break;
		}
		case KarmaAction.COMMENT_VOTE_REMOVAL:
			title = `Vote Removed! ${karmaChange > 0 ? "+" : ""}${karmaChange} karma`;
			description = "Someone removed their vote on your comment";
			break;
		default:
			title = `Karma ${isPositive ? "Gained" : "Lost"}! ${karmaChange}`;
			description = "Your karma has changed";
	}

	// Create action buttons
	const actions = [];

	// Add "View Post" action if we have a post URL
	if (postUrl) {
		actions.push({
			label: "View Post",
			onClick: () => {
				window.open(postUrl, "_blank");
			},
		});
	}

	// Add "View History" action
	actions.push({
		label: "View History",
		onClick: () => {
			window.location.href = "/settings/karma";
		},
	});

	toast(title, {
		description,
		action:
			actions.length === 1
				? actions[0]
				: {
						label: "Actions",
						onClick: () => {
							// For multiple actions, show the post first, then history
							if (postUrl) {
								window.open(postUrl, "_blank");
							}
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
