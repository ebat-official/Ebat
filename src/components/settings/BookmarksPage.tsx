"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { useState } from "react";
import { bookmarkAction } from "@/actions/bookmark";
import { useBookmarks } from "@/hooks/query/useBookmarks";
import { LuBookmarkMinus, LuBookmarkPlus, LuBookmark } from "react-icons/lu";
import { Eye } from "lucide-react";
import { Link } from "react-transition-progress/next";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { PostCategory, PostType, SubCategory, Difficulty } from "@/db/schema/enums";

interface BookmarkItem {
	id: string;
	postId: string;
	createdAt: string;
	title?: string;
	category?: string;
	subcategory?: string;
	type?: string;
	difficulty?: string;
	coins?: number;
	authorName?: string;
}

// Column configuration for bookmarks table (same as approvals)
const bookmarkColumnConfig = [
	{
		id: "title",
		label: "Title",
		description: "Post title",
		category: "basic",
		sortable: false,
		filterable: false,
	},
	{
		id: "author",
		label: "Author",
		description: "Post author",
		category: "basic",
		sortable: false,
		filterable: false,
	},
	{
		id: "category",
		label: "Category",
		description: "Post category",
		category: "basic",
		sortable: false,
		filterable: true,
		filterOptions: [
			{ value: PostCategory.FRONTEND, label: "Frontend" },
			{ value: PostCategory.BACKEND, label: "Backend" },
			{ value: PostCategory.ANDROID, label: "Android" },
		],
	},
	{
		id: "subcategory",
		label: "Subcategory",
		description: "Post subcategory",
		category: "basic",
		sortable: false,
		filterable: true,
		filterOptions: [
			{ value: SubCategory.JAVASCRIPT, label: "JavaScript" },
			{ value: SubCategory.HTML, label: "HTML" },
			{ value: SubCategory.CSS, label: "CSS" },
			{ value: SubCategory.REACT, label: "React" },
			{ value: SubCategory.BLOGS, label: "Blogs" },
			{ value: SubCategory.SYSTEMDESIGN, label: "System Design" },
			{ value: SubCategory.VUE, label: "Vue" },
			{ value: SubCategory.ANGULAR, label: "Angular" },
			{ value: SubCategory.SVELTEKIT, label: "SvelteKit" },
			{ value: SubCategory.VANILLAJS, label: "Vanilla JS" },
			{ value: SubCategory.NEXTJS, label: "Next.js" },
		],
	},
	{
		id: "type",
		label: "Type",
		description: "Post type (question, challenge, etc.)",
		category: "basic",
		sortable: false,
		filterable: true,
		filterOptions: [
			{ value: PostType.QUESTION, label: "Question" },
			{ value: PostType.CHALLENGE, label: "Challenge" },
			{ value: PostType.BLOGS, label: "Blog" },
			{ value: PostType.SYSTEMDESIGN, label: "System Design" },
		],
	},
	{
		id: "difficulty",
		label: "Difficulty",
		description: "Post difficulty level",
		category: "basic",
		sortable: false,
		filterable: true,
		filterOptions: [
			{ value: Difficulty.EASY, label: "Easy" },
			{ value: Difficulty.MEDIUM, label: "Medium" },
			{ value: Difficulty.HARD, label: "Hard" },
		],
	},
	{
		id: "actions",
		label: "Actions",
		description: "Available actions",
		category: "actions",
		sortable: false,
		filterable: false,
	},
];

const bookmarkCategoryColumns = {
	basic: ["title", "author", "category", "subcategory", "type", "difficulty"],
	actions: ["actions"],
};

const bookmarkDefaultColumns = ["title", "author", "category", "subcategory", "type", "difficulty", "actions"];

// Constants for bookmarks
const BOOKMARK_CONSTANTS = {
	TITLES: {
		BOOKMARKS: "My Bookmarks",
	},
	EMPTY_MESSAGES: {
		NO_BOOKMARKS: "No bookmarks found. Start bookmarking posts to see them here!",
	},
	LOADING_MESSAGES: {
		BOOKMARKS: "Loading bookmarks...",
	},
	SEARCH_PLACEHOLDERS: {
		BOOKMARKS: "Search bookmarks...",
	},
	BADGE_LABELS: {
		BOOKMARKED: "Bookmarked",
	},
} as const;

export function BookmarksPage() {
	// State for search and pagination
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [filters, setFilters] = useState<Record<string, string>>({});

	// Use the new useBookmarks hook
	const {
		data: bookmarksData,
		isLoading,
		error,
		refetch,
	} = useBookmarks({
		searchQuery,
		filters: {
			category: filters.category || "",
			subcategory: filters.subcategory || "",
			type: filters.type || "",
			difficulty: filters.difficulty || "",
		},
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

	const { bookmarks = [], pagination: bookmarksPagination } = bookmarksData || {};
	const { totalBookmarks = 0, totalPages = 1 } = bookmarksPagination || {};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleRemoveBookmark = async (postId: string) => {
		try {
			await bookmarkAction({ postId, action: "remove" });
			// Refetch bookmarks after removal
			refetch();
		} catch (error) {
			console.error("Failed to remove bookmark:", error);
		}
	};

	const renderBookmarkActions = (bookmark: BookmarkItem) => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild>
					<Link href={`/post/${bookmark.postId}`} className="flex items-center">
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

	const renderBookmarkCell = (item: unknown, columnId: string) => {
		const bookmark = item as BookmarkItem;
		switch (columnId) {
			case "title":
				return (
					<Link
						href={`/post/${bookmark.postId}`}
						className="font-medium hover:underline"
					>
						{bookmark.title || `Post ${bookmark.postId}`}
					</Link>
				);
			case "author":
				return (
					<span className="font-medium">
						{bookmark.authorName || "Unknown"}
					</span>
				);
			case "category":
				return (
					<Badge variant="outline" className="text-xs">
						{bookmark.category || "Unknown"}
					</Badge>
				);
			case "subcategory":
				return (
					<Badge variant="outline" className="text-xs">
						{bookmark.subcategory || "Unknown"}
					</Badge>
				);
			case "type":
				return (
					<Badge variant="outline" className="text-xs">
						{bookmark.type || "Unknown"}
					</Badge>
				);
			case "difficulty":
				return (
					<Badge 
						variant="outline" 
						className={cn(
							"text-xs",
							bookmark.difficulty === "Easy" && "text-green-600 border-green-600",
							bookmark.difficulty === "Medium" && "text-yellow-600 border-yellow-600",
							bookmark.difficulty === "Hard" && "text-red-600 border-red-600",
						)}
					>
						{bookmark.difficulty || "Unknown"}
					</Badge>
				);
			case "actions":
				return renderBookmarkActions(bookmark);
			default:
				return bookmark[columnId as keyof BookmarkItem] || "";
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<LuBookmark className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
					<p className="text-muted-foreground">{BOOKMARK_CONSTANTS.LOADING_MESSAGES.BOOKMARKS}</p>
				</div>
			</div>
		);
	}

	if (bookmarks.length === 0) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<LuBookmark className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No Bookmarks</h3>
					<p className="text-muted-foreground">{BOOKMARK_CONSTANTS.EMPTY_MESSAGES.NO_BOOKMARKS}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">{BOOKMARK_CONSTANTS.TITLES.BOOKMARKS}</h2>
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
			/>
		</div>
	);
} 