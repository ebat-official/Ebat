import { ColumnConfig, CategoryColumns } from "@/components/shared/DataTable";
import {
	PostCategory,
	PostType,
	SubCategory,
	Difficulty,
} from "@/db/schema/enums";

// Posts-related constants
export const POSTS_CONSTANTS = {
	// Tab labels
	TABS: {
		MY_POSTS: "my-posts",
		POST_EDITS: "post-edits",
	},

	// Table titles
	TITLES: {
		MY_POSTS: "My Posts",
		POST_EDITS: "Post Edits",
		USER_POSTS: "User Posts",
	},

	// Empty state messages
	EMPTY_MESSAGES: {
		NO_MY_POSTS: "You haven't created any posts yet",
		NO_POST_EDITS: "You haven't made any post edits yet",
	},

	// Loading messages
	LOADING_MESSAGES: {
		POSTS: "Loading posts...",
		EDITS: "Loading edits...",
	},

	// Search placeholders
	SEARCH_PLACEHOLDERS: {
		POSTS: "Search posts...",
		EDITS: "Search edits...",
	},

	// Badge labels
	BADGE_LABELS: {
		MY_POSTS: "My Posts",
		POST_EDITS: "Post Edits",
		UNKNOWN: "Unknown",
		NOT_APPLICABLE: "N/A",
	},

	// Default values
	DEFAULTS: {
		UNTITLED: "Untitled",
		UNKNOWN_AUTHOR: "Unknown",
	},

	// Display limits
	DISPLAY_LIMITS: {
		MAX_COMPANIES_SHOWN: 2,
		MAX_TOPICS_SHOWN: 2,
	},
} as const;

// Column configuration for posts tables
export const postsColumnConfig: ColumnConfig[] = [
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
		id: "companies",
		label: "Companies",
		description: "Related companies",
		category: "details",
		sortable: false,
		filterable: false,
	},
	{
		id: "topics",
		label: "Topics",
		description: "Related topics",
		category: "details",
		sortable: false,
		filterable: false,
	},
	{
		id: "completionDuration",
		label: "Duration",
		description: "Estimated completion time",
		category: "details",
		sortable: false,
		filterable: false,
	},

	{
		id: "createdAt",
		label: "Created",
		description: "Creation date",
		category: "basic",
		sortable: true,
		filterable: false,
	},
	{
		id: "updatedAt",
		label: "Updated",
		description: "Last update date",
		category: "basic",
		sortable: false,
		filterable: false,
	},
	{
		id: "status",
		label: "Status",
		description: "Post status",
		category: "basic",
		sortable: false,
		filterable: false,
	},
	{
		id: "approvalStatus",
		label: "Approval Status",
		description: "Approval status",
		category: "basic",
		sortable: false,
		filterable: false,
	},
];

export const postsCategoryColumns: CategoryColumns = {
	basic: [
		"title",
		"author",
		"category",
		"subcategory",
		"type",
		"difficulty",
		"createdAt",
		"updatedAt",
		"status",
		"approvalStatus",
	],
	details: ["companies", "topics", "completionDuration"],
};

export const postsDefaultColumns = [
	"title",
	"category",
	"subcategory",
	"type",
	"status",
	"approvalStatus",
];
