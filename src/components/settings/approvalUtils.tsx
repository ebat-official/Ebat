import React from "react";
import { Badge } from "@/components/ui/badge";
import {
	PostApprovalStatus,
	PostCategory,
	PostType,
	Difficulty,
} from "@/db/schema/enums";
import { formatDistanceToNow } from "date-fns";
import { APPROVAL_CONSTANTS } from "./approvalConstants";
import type { PostWithAuthor, PostEditWithAuthor } from "./types";

/**
 * Renders approval status badge with appropriate styling
 */
export const getStatusBadge = (status: PostApprovalStatus) => {
	switch (status) {
		case PostApprovalStatus.PENDING:
			return <Badge variant="secondary">Pending</Badge>;
		case PostApprovalStatus.APPROVED:
			return <Badge variant="default">Approved</Badge>;
		case PostApprovalStatus.REJECTED:
			return <Badge variant="destructive">Rejected</Badge>;
		default:
			return (
				<Badge variant="outline">
					{APPROVAL_CONSTANTS.BADGE_LABELS.UNKNOWN}
				</Badge>
			);
	}
};

/**
 * Renders post type badge with appropriate styling
 */
export const getTypeBadge = (type: PostType) => {
	switch (type) {
		case PostType.QUESTION:
			return <Badge variant="outline">Question</Badge>;
		case PostType.CHALLENGE:
			return <Badge variant="outline">Challenge</Badge>;
		case PostType.BLOGS:
			return <Badge variant="outline">Blog</Badge>;
		case PostType.SYSTEMDESIGN:
			return <Badge variant="outline">System Design</Badge>;
		default:
			return (
				<Badge variant="outline">
					{APPROVAL_CONSTANTS.BADGE_LABELS.UNKNOWN}
				</Badge>
			);
	}
};

/**
 * Renders category badge with appropriate styling
 */
export const getCategoryBadge = (category: PostCategory) => {
	switch (category) {
		case PostCategory.FRONTEND:
			return <Badge variant="secondary">Frontend</Badge>;
		case PostCategory.BACKEND:
			return <Badge variant="secondary">Backend</Badge>;
		case PostCategory.ANDROID:
			return <Badge variant="secondary">Android</Badge>;
		default:
			return (
				<Badge variant="outline">
					{APPROVAL_CONSTANTS.BADGE_LABELS.UNKNOWN}
				</Badge>
			);
	}
};

/**
 * Renders difficulty badge with appropriate styling
 */
export const getDifficultyBadge = (difficulty: Difficulty) => {
	switch (difficulty) {
		case Difficulty.EASY:
			return <Badge variant="default">Easy</Badge>;
		case Difficulty.MEDIUM:
			return <Badge variant="secondary">Medium</Badge>;
		case Difficulty.HARD:
			return <Badge variant="destructive">Hard</Badge>;
		default:
			return (
				<Badge variant="outline">
					{APPROVAL_CONSTANTS.BADGE_LABELS.UNKNOWN}
				</Badge>
			);
	}
};

/**
 * Renders author information
 */
export const renderAuthor = (
	author: PostWithAuthor["author"] | PostEditWithAuthor["author"],
) => {
	if (!author) {
		return (
			<Badge variant="outline">{APPROVAL_CONSTANTS.BADGE_LABELS.UNKNOWN}</Badge>
		);
	}

	return (
		<span className="font-medium">
			{author.name ||
				author.username ||
				APPROVAL_CONSTANTS.DEFAULTS.UNKNOWN_AUTHOR}
		</span>
	);
};

/**
 * Renders companies with limit and overflow indicator
 */
export const renderCompanies = (companies: string[] | null) => {
	if (!companies || companies.length === 0) {
		return (
			<Badge variant="outline">
				{APPROVAL_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
			</Badge>
		);
	}

	const { MAX_COMPANIES_SHOWN } = APPROVAL_CONSTANTS.DISPLAY_LIMITS;

	return (
		<div className="flex flex-wrap gap-1">
			{companies.slice(0, MAX_COMPANIES_SHOWN).map((company, index) => (
				<Badge key={index} variant="outline" className="text-xs">
					{company}
				</Badge>
			))}
			{companies.length > MAX_COMPANIES_SHOWN && (
				<Badge variant="outline" className="text-xs">
					+{companies.length - MAX_COMPANIES_SHOWN}
				</Badge>
			)}
		</div>
	);
};

/**
 * Renders topics with limit and overflow indicator
 */
export const renderTopics = (topics: string[] | null) => {
	if (!topics || topics.length === 0) {
		return (
			<Badge variant="outline">
				{APPROVAL_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
			</Badge>
		);
	}

	const { MAX_TOPICS_SHOWN } = APPROVAL_CONSTANTS.DISPLAY_LIMITS;

	return (
		<div className="flex flex-wrap gap-1">
			{topics.slice(0, MAX_TOPICS_SHOWN).map((topic, index) => (
				<Badge key={index} variant="outline" className="text-xs">
					{topic}
				</Badge>
			))}
			{topics.length > MAX_TOPICS_SHOWN && (
				<Badge variant="outline" className="text-xs">
					+{topics.length - MAX_TOPICS_SHOWN}
				</Badge>
			)}
		</div>
	);
};

/**
 * Renders completion duration
 */
export const renderCompletionDuration = (duration: number | null) => {
	return duration
		? `${duration} min`
		: APPROVAL_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE;
};

/**
 * Renders formatted date
 */
export const renderFormattedDate = (date: Date | string) => {
	return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Renders post cell content based on column ID
 */
export const renderPostCell = (post: PostWithAuthor, columnId: string) => {
	switch (columnId) {
		case "title":
			return post.title || APPROVAL_CONSTANTS.DEFAULTS.UNTITLED;
		case "author":
			return renderAuthor(post.author);
		case "category":
			return getCategoryBadge(post.category);
		case "subcategory":
			return (
				<Badge variant="outline">
					{post.subCategory || APPROVAL_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
				</Badge>
			);
		case "type":
			return getTypeBadge(post.type);
		case "difficulty":
			return post.difficulty ? (
				getDifficultyBadge(post.difficulty)
			) : (
				<Badge variant="outline">
					{APPROVAL_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
				</Badge>
			);
		case "companies":
			return renderCompanies(post.companies);
		case "topics":
			return renderTopics(post.topics);
		case "completionDuration":
			return renderCompletionDuration(post.completionDuration);

		case "createdAt":
			return renderFormattedDate(post.createdAt);
		case "updatedAt":
			return renderFormattedDate(post.updatedAt);
		case "status":
			return <Badge variant="outline">{post.status}</Badge>;
		case "approvalStatus":
			return getStatusBadge(post.approvalStatus);
		default:
			return "-";
	}
};

/**
 * Renders post edit cell content based on column ID
 */
export const renderEditCell = (edit: PostEditWithAuthor, columnId: string) => {
	switch (columnId) {
		case "title":
			return edit.title || APPROVAL_CONSTANTS.DEFAULTS.UNTITLED;
		case "author":
			return renderAuthor(edit.author);
		case "category":
			return getCategoryBadge(edit.category);
		case "subcategory":
			return (
				<Badge variant="outline">
					{edit.subCategory || APPROVAL_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
				</Badge>
			);
		case "type":
			return getTypeBadge(edit.type);
		case "difficulty":
			return edit.difficulty ? (
				getDifficultyBadge(edit.difficulty)
			) : (
				<Badge variant="outline">
					{APPROVAL_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
				</Badge>
			);
		case "companies":
			return renderCompanies(edit.companies);
		case "topics":
			return renderTopics(edit.topics);
		case "completionDuration":
			return renderCompletionDuration(edit.completionDuration);

		case "createdAt":
			return renderFormattedDate(edit.createdAt);
		case "updatedAt":
			return renderFormattedDate(edit.updatedAt);
		case "status":
			return (
				<Badge variant="outline">
					{APPROVAL_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
				</Badge>
			); // Post edits don't have status
		case "approvalStatus":
			return getStatusBadge(edit.approvalStatus);
		default:
			return "-";
	}
};
