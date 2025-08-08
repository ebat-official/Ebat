import {
	AudioWaveform,
	Bookmark,
	Command,
	FileText,
	LayoutGrid,
	LucideIcon,
	Settings,
	Users,
} from "lucide-react";
import { IconType } from "react-icons";
import { DiJavascript1 } from "react-icons/di";
import {
	FaCss3,
	FaHtml5,
	FaProjectDiagram,
	FaReact,
	FaSitemap,
	FaAngular,
	FaVuejs,
} from "react-icons/fa";
import { ImHtmlFive2 } from "react-icons/im";
import { IoLogoJavascript } from "react-icons/io";
import { SiNextdotjs, SiSvelte } from "react-icons/si";
import { PostCategory, SubCategory } from "@/db/schema/enums";

/**
 * Helper functions for URL generation
 * These functions ensure consistent URL patterns across the application
 */

const createSubmenuUrl = (
	category: PostCategory,
	subcategory: SubCategory,
	type: string,
) => `/${category}/${subcategory}/${type}`;

const createSubmenuCreateUrl = (
	category: PostCategory,
	subcategory: SubCategory,
	type: string,
) => `/${category}/${subcategory}/${type}/create`;

const createSystemDesignUrl = (category: PostCategory, type: "hld" | "lld") =>
	`/${category}/systemdesign?type=${type}`;

// Helper function to create submenu items
const createSubmenuItems = (
	category: PostCategory,
	subcategory: SubCategory,
) => [
	{
		href: createSubmenuUrl(category, subcategory, "questions"),
		label: "Questions",
		createHref: createSubmenuCreateUrl(category, subcategory, "questions"),
	},
	{
		href: createSubmenuUrl(category, subcategory, "challenges"),
		label: "Coding Challenges",
		createHref: createSubmenuCreateUrl(category, subcategory, "challenges"),
	},
	{
		href: createSubmenuUrl(category, subcategory, SubCategory.BLOGS),
		label: "Blogs",
		createHref: createSubmenuCreateUrl(
			category,
			subcategory,
			SubCategory.BLOGS,
		),
	},
];

export type Submenu = {
	href: string;
	label: string;
	active?: boolean;
	disabled?: boolean;
	hide?: boolean;
	createHref?: string; // URL for create action
};

export type IconTypes = LucideIcon | IconType;

type Menu = {
	href: string;
	label: string;
	active?: boolean;
	disabled?: boolean;
	hide?: boolean;
	icon: LucideIcon | IconType;
	submenus?: Submenu[] | undefined;
};

type Group = {
	groupLabel: string;
	menus: Menu[];
	hide?: boolean;
};

export type SidebarConfigType = {
	categories: {
		name: string;
		logo: IconTypes;
		logoClassName?: string;
		route: string;
		hide?: boolean;
		disabled?: boolean;
	}[];
	menuList: Group[];
	navigation: Group[];
};

// Common navigation items that are shared across categories
const commonNavigationItems: Menu[] = [
	{
		href: "/settings/profile",
		label: "Profile",
		icon: Users,
		submenus: [],
	},
];

// Category-specific navigation configurations
const categoryNavigation: Record<PostCategory, Menu[]> = {
	[PostCategory.FRONTEND]: [
		{
			href: `/${PostCategory.FRONTEND}`,
			label: "Dashboard",
			icon: LayoutGrid,
			submenus: [],
		},
		...commonNavigationItems,
	],
	[PostCategory.BACKEND]: [
		{
			href: `/${PostCategory.BACKEND}`,
			label: "Dashboard",
			icon: LayoutGrid,
			submenus: [],
		},
		...commonNavigationItems,
	],
	[PostCategory.ANDROID]: [
		{
			href: `/${PostCategory.ANDROID}`,
			label: "Dashboard",
			icon: LayoutGrid,
			submenus: [],
		},
		...commonNavigationItems,
	],
};

// Category-specific menu configurations
const categoryMenus: Record<PostCategory, Menu[]> = {
	[PostCategory.FRONTEND]: [
		{
			href: "",
			label: "HTML",
			icon: ImHtmlFive2,
			submenus: [
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.HTML}/questions`,
					label: "Questions",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.HTML}/questions/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.HTML}/challenges`,
					label: "Coding Challenges",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.HTML}/challenges/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.HTML}/${SubCategory.BLOGS}`,
					label: "Blogs",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.HTML}/${SubCategory.BLOGS}/create`,
				},
			],
		},
		{
			href: "",
			label: "CSS",
			icon: FaCss3,
			submenus: [
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.CSS}/questions`,
					label: "Questions",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.CSS}/questions/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.CSS}/challenges`,
					label: "Coding Challenges",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.CSS}/challenges/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.CSS}/${SubCategory.BLOGS}`,
					label: "Blogs",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.CSS}/${SubCategory.BLOGS}/create`,
				},
			],
		},
		{
			href: "",
			label: "JavaScript",
			icon: DiJavascript1,
			submenus: [
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.JAVASCRIPT}/questions`,
					label: "Questions",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.JAVASCRIPT}/questions/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.JAVASCRIPT}/challenges`,
					label: "Coding Challenges",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.JAVASCRIPT}/challenges/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.JAVASCRIPT}/${SubCategory.BLOGS}`,
					label: "Blogs",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.JAVASCRIPT}/${SubCategory.BLOGS}/create`,
				},
			],
		},
		{
			href: "",
			label: "React",
			icon: FaReact,
			submenus: [
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.REACT}/questions`,
					label: "Questions",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.REACT}/questions/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.REACT}/challenges`,
					label: "Coding Challenges",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.REACT}/challenges/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.REACT}/${SubCategory.BLOGS}`,
					label: "Blogs",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.REACT}/${SubCategory.BLOGS}/create`,
				},
			],
		},
		{
			href: "",
			label: "Angular",
			icon: FaAngular,
			submenus: [
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.ANGULAR}/questions`,
					label: "Questions",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.ANGULAR}/questions/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.ANGULAR}/challenges`,
					label: "Coding Challenges",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.ANGULAR}/challenges/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.ANGULAR}/${SubCategory.BLOGS}`,
					label: "Blogs",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.ANGULAR}/${SubCategory.BLOGS}/create`,
				},
			],
		},
		{
			href: "",
			label: "Vue.js",
			icon: FaVuejs,
			submenus: [
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.VUE}/questions`,
					label: "Questions",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.VUE}/questions/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.VUE}/challenges`,
					label: "Coding Challenges",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.VUE}/challenges/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.VUE}/${SubCategory.BLOGS}`,
					label: "Blogs",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.VUE}/${SubCategory.BLOGS}/create`,
				},
			],
		},
		{
			href: "",
			label: "Next.js",
			icon: SiNextdotjs,
			submenus: [
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.NEXTJS}/questions`,
					label: "Questions",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.NEXTJS}/questions/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.NEXTJS}/challenges`,
					label: "Coding Challenges",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.NEXTJS}/challenges/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.NEXTJS}/${SubCategory.BLOGS}`,
					label: "Blogs",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.NEXTJS}/${SubCategory.BLOGS}/create`,
				},
			],
		},
		{
			href: "",
			label: "SvelteKit",
			icon: SiSvelte,
			submenus: [
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.SVELTEKIT}/questions`,
					label: "Questions",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.SVELTEKIT}/questions/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.SVELTEKIT}/challenges`,
					label: "Coding Challenges",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.SVELTEKIT}/challenges/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.SVELTEKIT}/${SubCategory.BLOGS}`,
					label: "Blogs",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.SVELTEKIT}/${SubCategory.BLOGS}/create`,
				},
			],
		},
		{
			href: "",
			label: "Vanilla JS",
			icon: IoLogoJavascript,
			submenus: [
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.VANILLAJS}/questions`,
					label: "Questions",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.VANILLAJS}/questions/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.VANILLAJS}/challenges`,
					label: "Coding Challenges",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.VANILLAJS}/challenges/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.VANILLAJS}/${SubCategory.BLOGS}`,
					label: "Blogs",
					createHref: `/${PostCategory.FRONTEND}/${SubCategory.VANILLAJS}/${SubCategory.BLOGS}/create`,
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.VANILLAJS}/advanced`,
					label: "Advanced Topics",
					disabled: true, // This submenu item will be disabled
				},
				{
					href: `/${PostCategory.FRONTEND}/${SubCategory.VANILLAJS}/experimental`,
					label: "Experimental",
					hide: true, // This submenu item will be hidden
				},
			],
		},
	],
	[PostCategory.BACKEND]: [
		{
			href: "",
			label: "Node.js",
			icon: IoLogoJavascript,
			submenus: [
				{
					href: `/${PostCategory.BACKEND}/nodejs/questions`,
					label: "Questions",
				},
				{
					href: `/${PostCategory.BACKEND}/nodejs/challenges`,
					label: "Coding Challenges",
				},
				{
					href: `/${PostCategory.BACKEND}/nodejs/blogs`,
					label: "Blogs",
				},
			],
		},
		{
			href: "",
			label: "Python",
			icon: Command,
			submenus: [
				{
					href: `/${PostCategory.BACKEND}/python/questions`,
					label: "Questions",
				},
				{
					href: `/${PostCategory.BACKEND}/python/challenges`,
					label: "Coding Challenges",
				},
				{
					href: `/${PostCategory.BACKEND}/python/blogs`,
					label: "Blogs",
				},
			],
		},
		{
			href: "",
			label: "Java",
			icon: Command,
			submenus: [
				{
					href: `/${PostCategory.BACKEND}/java/questions`,
					label: "Questions",
				},
				{
					href: `/${PostCategory.BACKEND}/java/challenges`,
					label: "Coding Challenges",
				},
				{
					href: `/${PostCategory.BACKEND}/java/blogs`,
					label: "Blogs",
				},
			],
		},
		{
			href: "",
			label: "System Design",
			icon: FaSitemap,
			submenus: [
				{
					href: `/${PostCategory.BACKEND}/${SubCategory.SYSTEMDESIGN}/questions`,
					label: "Questions",
				},
				{
					href: `/${PostCategory.BACKEND}/${SubCategory.SYSTEMDESIGN}/challenges`,
					label: "Coding Challenges",
				},
				{
					href: `/${PostCategory.BACKEND}/${SubCategory.SYSTEMDESIGN}/${SubCategory.BLOGS}`,
					label: "Blogs",
				},
			],
		},
	],
	[PostCategory.ANDROID]: [
		{
			href: "",
			label: "Android Development",
			icon: Command,
			submenus: [
				{
					href: `/${PostCategory.ANDROID}/android/questions`,
					label: "Questions",
				},
				{
					href: `/${PostCategory.ANDROID}/android/challenges`,
					label: "Coding Challenges",
				},
				{
					href: `/${PostCategory.ANDROID}/android/blogs`,
					label: "Blogs",
				},
			],
		},
	],
};

const SidebarConfig = {
	categories: [
		{
			name: "Frontend",
			logo: FaReact,
			logoClassName: "text-blue-500",
			route: `/${PostCategory.FRONTEND}`,
		},
		{
			name: "Backend",
			logo: AudioWaveform,
			route: `/${PostCategory.BACKEND}`,
			disabled: true, // Disable backend category (grayed out but visible)
		},
		{
			name: "Android",
			logo: Command,
			route: `/${PostCategory.ANDROID}`,
			hide: true, // Hide android category completely
		},
		{
			name: "Tools",
			logo: Command,
			route: "/tools",
		},
	],
	navigation: [
		{
			groupLabel: "",
			menus: categoryNavigation[PostCategory.FRONTEND], // Default to frontend
		},
	],
	menuList: [
		{
			groupLabel: "Languages",
			menus: categoryMenus[PostCategory.FRONTEND], // Use the centralized configuration
		},
		{
			groupLabel: "Common",
			menus: [
				{
					href: "",
					label: "Behavioral",
					icon: Users,
					submenus: [
						{
							href: `/${PostCategory.FRONTEND}/${SubCategory.BEHAVIORAL}/how-to-prepare`,
							label: "How to Prepare",
							createHref: `/${PostCategory.FRONTEND}/${SubCategory.BEHAVIORAL}/how-to-prepare/create`,
						},
						{
							href: `/${PostCategory.FRONTEND}/${SubCategory.BEHAVIORAL}/radio-framework`,
							label: "Radio Framework",
							createHref: `/${PostCategory.FRONTEND}/${SubCategory.BEHAVIORAL}/radio-framework/create`,
						},
						{
							href: `/${PostCategory.FRONTEND}/${SubCategory.BEHAVIORAL}/questions`,
							label: "Questions",
							createHref: `/${PostCategory.FRONTEND}/${SubCategory.BEHAVIORAL}/questions/create`,
						},
					],
				},
				{
					href: "",
					label: "System Design (HLD)",
					icon: FaSitemap,
					submenus: [
						{
							href: `/${PostCategory.FRONTEND}/systemdesign/hld/how-to-prepare`,
							label: "How to Prepare",
							createHref: `/${PostCategory.FRONTEND}/systemdesign/hld/how-to-prepare/create`,
						},
						{
							href: `/${PostCategory.FRONTEND}/systemdesign/hld/framework`,
							label: "Framework",
							createHref: `/${PostCategory.FRONTEND}/systemdesign/hld/framework/create`,
						},
						{
							href: `/${PostCategory.FRONTEND}/systemdesign/hld/questions`,
							label: "Questions",
							createHref: `/${PostCategory.FRONTEND}/systemdesign/hld/questions/create`,
						},
					],
				},
				{
					href: "",
					label: "System Design (LLD)",
					icon: FaProjectDiagram,
					submenus: [
						{
							href: `/${PostCategory.FRONTEND}/systemdesign/lld/how-to-prepare`,
							label: "How to Prepare",
							createHref: `/${PostCategory.FRONTEND}/systemdesign/lld/how-to-prepare/create`,
						},
						{
							href: `/${PostCategory.FRONTEND}/systemdesign/lld/framework`,
							label: "Framework",
							createHref: `/${PostCategory.FRONTEND}/systemdesign/lld/framework/create`,
						},
						{
							href: `/${PostCategory.FRONTEND}/systemdesign/lld/questions`,
							label: "Questions",
							createHref: `/${PostCategory.FRONTEND}/systemdesign/lld/questions/create`,
						},
					],
				},
			],
		},
		{
			groupLabel: "Settings",
			menus: [
				{
					href: "/settings/posts",
					label: "My Posts",
					icon: FileText,
				},
				{
					href: "/settings/bookmarks",
					label: "Bookmarks",
					icon: Bookmark,
				},
				{
					href: "/settings/account",
					label: "Account",
					icon: Settings,
				},
			],
			hide: true, // Hide the entire settings group
		},
	],
};

// Function to get sidebar config based on selected category
export function getSidebarConfig(category?: PostCategory): SidebarConfigType {
	const config = { ...SidebarConfig };

	if (category && categoryMenus[category]) {
		// Update menu list based on category
		config.menuList = [
			{
				groupLabel: "Contents",
				menus: categoryMenus[category],
			},
			...config.menuList.slice(1), // Keep settings and other groups
		];

		// Update navigation based on category
		config.navigation = [
			{
				groupLabel: "",
				menus: categoryNavigation[category],
			},
		];
	}

	return config;
}

// Function to get available categories
export function getAvailableCategories() {
	return SidebarConfig.categories;
}

// Function to get menu items for a specific category
export function getCategoryMenus(category: PostCategory): Menu[] {
	return categoryMenus[category] || [];
}

// Function to get navigation items for a specific category
export function getCategoryNavigation(category: PostCategory): Menu[] {
	return categoryNavigation[category] || [];
}
