"use client";

import { useState } from "react";
import { useUserKarma } from "@/hooks/query/useUserKarma";
import { KarmaAction, VoteType } from "@/db/schema/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { KarmaLogEntry } from "@/types/karma";

const getActionIcon = (action: string) => {
	switch (action) {
		case KarmaAction.POST_APPROVAL:
		case KarmaAction.POST_EDIT_APPROVAL:
			return <span className="h-4 w-4 text-green-500">✓</span>;
		case KarmaAction.POST_VOTE:
		case KarmaAction.COMMENT_VOTE:
			return <span className="h-4 w-4 text-orange-500">▲</span>;
		case KarmaAction.POST_VOTE_REMOVAL:
		case KarmaAction.COMMENT_VOTE_REMOVAL:
			return <span className="h-4 w-4 text-red-500">▼</span>;
		default:
			return <span className="h-4 w-4 text-gray-500">✏</span>;
	}
};

const getActionLabel = (
	action: string,
	metadata?: Record<string, unknown>,
	fromUser?: { username: string; displayUsername?: string },
) => {
	const username = fromUser?.displayUsername || fromUser?.username || "Someone";

	switch (action) {
		case KarmaAction.POST_APPROVAL: {
			if (metadata?.isApprover) {
				const postTitle = metadata?.postTitle as string;
				return `You approved "${postTitle || "a post"}"`;
			}
			const postTitle = metadata?.postTitle as string;
			return `${username} approved your post "${postTitle || "unknown"}"`;
		}
		case KarmaAction.POST_EDIT_APPROVAL: {
			if (metadata?.isApprover) {
				const postTitle = metadata?.postTitle as string;
				return `You approved an edit to "${postTitle || "a post"}"`;
			}
			const editPostTitle = metadata?.postTitle as string;
			return `${username} approved your edit to "${editPostTitle || "a post"}"`;
		}
		case KarmaAction.POST_VOTE:
			return metadata?.voteType === VoteType.UP
				? `${username} upvoted your post`
				: `${username} downvoted your post`;
		case KarmaAction.COMMENT_VOTE:
			return metadata?.voteType === VoteType.UP
				? `${username} upvoted your comment`
				: `${username} downvoted your comment`;
		case KarmaAction.POST_VOTE_REMOVAL:
			return `${username} removed their vote on your post`;
		case KarmaAction.COMMENT_VOTE_REMOVAL:
			return `${username} removed their vote on your comment`;
		default:
			return action;
	}
};

export const KarmaHistory = () => {
	const [currentPage, setCurrentPage] = useState(0);
	const limit = 20;
	const offset = currentPage * limit;

	const { data, isLoading, error } = useUserKarma({ limit, offset });

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Karma History</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Karma History</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-red-500">
						Failed to load karma history
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data?.karmaLogs || data.karmaLogs.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Karma History</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-muted-foreground">
						No karma history yet
					</div>
				</CardContent>
			</Card>
		);
	}

	const totalPages = data.pagination.totalPages;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Karma History</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{data.karmaLogs.map((log: KarmaLogEntry) => (
						<div
							key={log.id}
							className="flex items-center justify-between p-3 border rounded-lg"
						>
							<div className="flex items-center gap-3">
								{getActionIcon(log.action)}
								<div>
									<div className="font-medium">
										{getActionLabel(log.action, log.metadata, log.fromUser)}
									</div>
									<div className="text-sm text-muted-foreground">
										{formatDistanceToNow(new Date(log.createdAt), {
											addSuffix: true,
										})}
									</div>
								</div>
							</div>
							<Badge
								variant={log.karmaChange > 0 ? "default" : "destructive"}
								className="ml-2"
							>
								{log.karmaChange > 0 ? "+" : ""}
								{log.karmaChange}
							</Badge>
						</div>
					))}
				</div>

				{totalPages > 1 && (
					<div className="flex items-center justify-between mt-6">
						<Button
							variant="outline"
							onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
							disabled={currentPage === 0}
						>
							Previous
						</Button>
						<span className="text-sm text-muted-foreground">
							Page {currentPage + 1} of {totalPages}
						</span>
						<Button
							variant="outline"
							onClick={() =>
								setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
							}
							disabled={currentPage === totalPages - 1}
						>
							Next
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
