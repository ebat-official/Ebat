import {
	Difficulty,
	PostCategory,
	PostType,
	SubCategory,
} from "@/db/schema/enums";
import type { ColumnConfig } from "@/components/shared/DataTable";

// Constants for bookmarks
export const BOOKMARK_CONSTANTS = {
	TITLES: {
		BOOKMARKS: "My Bookmarks",
	},
	EMPTY_MESSAGES: {
		NO_BOOKMARKS:
			"No bookmarks found. Start bookmarking posts to see them here!",
	},
	LOADING_MESSAGES: {
		BOOKMARKS: "Loading bookmarks...",
	},
	SEARCH_PLACEHOLDERS: {
		BOOKMARKS: "Search bookmarks...",
	},
	BADGE_LABELS: {
		BOOKMARKED: "Bookmarked",
		UNKNOWN: "Unknown",
	},
} as const;

// Column configuration for bookmarks table
export const bookmarkColumnConfig: ColumnConfig[] = [
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
			{ value: PostType.HLD, label: "System Design (HLD)" },
			{ value: PostType.LLD, label: "System Design (LLD)" },
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

export const bookmarkCategoryColumns = {
	basic: ["title", "author", "category", "subcategory", "type", "difficulty"],
	actions: ["actions"],
};

export const bookmarkDefaultColumns = [
	"title",
	"author",
	"category",
	"subcategory",
	"type",
	"difficulty",
	"actions",
];
