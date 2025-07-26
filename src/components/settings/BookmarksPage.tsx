"use client";

import { bookmarkAction } from "@/actions/bookmark";
import { BOOKMARK_ACTIONS } from "@/utils/constants";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Difficulty,
	PostCategory,
	PostType,
	SubCategory,
} from "@/db/schema/enums";
import { useBookmarks } from "@/hooks/query/useBookmarks";
import { cn } from "@/lib/utils";
import { generatePostPath } from "@/utils/generatePostPath";
import { Eye } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { LuBookmark, LuBookmarkMinus, LuBookmarkPlus } from "react-icons/lu";
import { Link } from "react-transition-progress/next";
import type { BookmarkWithPost } from "./types";
import {
	BOOKMARK_CONSTANTS,
	bookmarkColumnConfig,
	bookmarkCategoryColumns,
	bookmarkDefaultColumns,
} from "./bookmarkConstants";

export function BookmarksPage() {
	// State for search and pagination
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [filters, setFilters] = useState<Record<string, string>>({});

	// Convert string filters to typed filters for the hook
	const typedFilters = {
		category: filters.category as PostCategory | undefined,
		subcategory: filters.subcategory as SubCategory | undefined,
		type: filters.type as PostType | undefined,
		difficulty: filters.difficulty as Difficulty | undefined,
	};

	// Use the new useBookmarks hook
	const {
		data: bookmarksData,
		isLoading,
		error,
		refetch,
	} = useBookmarks({
		searchQuery,
		filters: typedFilters,
		page: currentPage,
		pageSize,
	});

	if (error) {
		return (
			<div className="flex items-center justify-center p-8 text-destructive">
				Error loading bookmarks: {error.message}
			</div>
		);
	}

	const { bookmarks = [], pagination: bookmarksPagination } =
		bookmarksData || {};
	const { totalBookmarks = 0, totalPages = 1 } = bookmarksPagination || {};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleRemoveBookmark = async (postId: string) => {
		try {
			await bookmarkAction({ postId, action: BOOKMARK_ACTIONS.REMOVE });
			// Refetch bookmarks after removal
			refetch();
		} catch (error) {
			console.error("Failed to remove bookmark:", error);
		}
	};

	const renderBookmarkActions = (bookmark: BookmarkWithPost) => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild>
					<Link
						href={generatePostPath({
							category: bookmark.post?.category || PostCategory.FRONTEND,
							subCategory: bookmark.post?.subCategory || SubCategory.JAVASCRIPT,
							slug: bookmark.post?.slug || "",
							id: bookmark.postId,
							postType: bookmark.post?.type || PostType.QUESTION,
						})}
						className="flex items-center"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Eye className="mr-2 h-4 w-4" />
						View Post
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => handleRemoveBookmark(bookmark.postId)}
					className="text-destructive"
				>
					<LuBookmarkMinus className="mr-2 h-4 w-4" />
					Remove Bookmark
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	const renderBookmarkCell = (item: BookmarkWithPost, columnId: string) => {
		switch (columnId) {
			case "title":
				return (
					<Link
						href={generatePostPath({
							category: item.post.category,
							subCategory: item.post.subCategory,
							slug: item.post.slug || "",
							id: item.postId,
							postType: item.post.type,
						})}
						className="font-medium hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						{item.post.title || `Post ${item.postId}`}
					</Link>
				);
			case "author":
				return (
					<span className="font-medium">
						{item.post?.author?.name || BOOKMARK_CONSTANTS.BADGE_LABELS.UNKNOWN}
					</span>
				);
			case "category":
				return (
					<Badge variant="outline" className="text-xs">
						{item.post?.category || BOOKMARK_CONSTANTS.BADGE_LABELS.UNKNOWN}
					</Badge>
				);
			case "subcategory":
				return (
					<Badge variant="outline" className="text-xs">
						{item.post?.subCategory || BOOKMARK_CONSTANTS.BADGE_LABELS.UNKNOWN}
					</Badge>
				);
			case "type":
				return (
					<Badge variant="outline" className="text-xs">
						{item.post?.type || BOOKMARK_CONSTANTS.BADGE_LABELS.UNKNOWN}
					</Badge>
				);
			case "difficulty":
				return (
					<Badge
						variant="outline"
						className={cn(
							"text-xs",
							item.post?.difficulty === Difficulty.EASY &&
								"text-green-600 border-green-600",
							item.post?.difficulty === Difficulty.MEDIUM &&
								"text-yellow-600 border-yellow-600",
							item.post?.difficulty === Difficulty.HARD &&
								"text-red-600 border-red-600",
						)}
					>
						{item.post?.difficulty || BOOKMARK_CONSTANTS.BADGE_LABELS.UNKNOWN}
					</Badge>
				);
			case "actions":
				return renderBookmarkActions(item);
			default:
				return (
					<span>{String(item[columnId as keyof BookmarkWithPost] || "")}</span>
				);
		}
	};

	if (!isLoading && bookmarks.length === 0) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<LuBookmark className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No Bookmarks</h3>
					<p className="text-muted-foreground">
						{BOOKMARK_CONSTANTS.EMPTY_MESSAGES.NO_BOOKMARKS}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						{BOOKMARK_CONSTANTS.TITLES.BOOKMARKS}
					</h2>
					<p className="text-muted-foreground">
						Manage your bookmarked posts ({totalBookmarks} total)
					</p>
				</div>
				<Badge variant="secondary" className="flex items-center gap-1">
					<LuBookmark className="h-4 w-4" />
					{totalBookmarks} bookmarks
				</Badge>
			</div>

			<DataTable
				data={bookmarks}
				loading={isLoading}
				columns={bookmarkColumnConfig}
				categoryColumns={bookmarkCategoryColumns}
				defaultColumns={bookmarkDefaultColumns}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				sortField="createdAt"
				sortOrder="desc"
				setSortField={() => {}} // No-op since we don't use sorting
				setSortOrder={() => {}} // No-op since we don't use sorting
				currentPage={currentPage}
				pageSize={pageSize}
				totalItems={totalBookmarks}
				totalPages={totalPages}
				onPageChange={handlePageChange}
				showPagination={true}
				searchPlaceholder={BOOKMARK_CONSTANTS.SEARCH_PLACEHOLDERS.BOOKMARKS}
				renderCell={renderBookmarkCell}
				filters={filters}
				setFilters={setFilters}
				loadingMessage={BOOKMARK_CONSTANTS.LOADING_MESSAGES.BOOKMARKS}
				emptyMessage={BOOKMARK_CONSTANTS.EMPTY_MESSAGES.NO_BOOKMARKS}
			/>
		</div>
	);
}
