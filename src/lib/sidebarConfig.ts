import {
	Tag,
	Users,
	Settings,
	LayoutGrid,
	LucideIcon,
	AudioWaveform,
	Command,
} from "lucide-react";
import {
	FaCss3,
	FaHtml5,
	FaProjectDiagram,
	FaReact,
	FaSitemap,
} from "react-icons/fa";
import { IconType } from "react-icons";
import { IoLogoJavascript } from "react-icons/io";
import { DiJavascript1 } from "react-icons/di";
import { ImHtmlFive2 } from "react-icons/im";
type Submenu = {
	href: string;
	label: string;
	active?: boolean;
};

export type IconTypes = LucideIcon | IconType;

type Menu = {
	href: string;
	label: string;
	active?: boolean;
	icon: LucideIcon | IconType;
	submenus?: Submenu[];
};

type Group = {
	groupLabel: string;
	menus: Menu[];
};

export type SidebarConfigType = {
	categories: {
		name: string;
		logo: IconTypes;
		logoClassName?: string;
		route: string;
	}[];
	menuList: Group[];
	navigation: Group[];
};

const SidebarConfig = {
	categories: [
		{
			name: "FrontEnd",
			logo: FaReact,
			logoClassName: "text-blue-500",
			// plan: "Enterprise",
			route: "/frontend",
		},
		{
			name: "Backend",
			logo: AudioWaveform,
			route: "/backend",
			// plan: "Startup",
		},
		{
			name: "Tools",
			logo: Command,
			route: "/tools",
			// plan: "Free",
		},
	],
	navigation: [
		{
			groupLabel: "",
			menus: [
				{
					href: "/dashboard",
					label: "Dashboard",
					icon: LayoutGrid,
					submenus: [],
				},
				{
					href: "/profile",
					label: "Profile",
					icon: Users,
					submenus: [],
				},
			],
		},
	],
	menuList: [
		{
			groupLabel: "Contents",
			menus: [
				{
					href: "",
					label: "HTML",
					icon: ImHtmlFive2,
					submenus: [
						{
							href: "/frontend/html/questions/create",
							label: "Questions",
						},
						{
							href: "/posts/new",
							label: "Coding Challaenges",
						},
						{
							href: "/posts",
							label: "Articles",
						},
					],
				},
				{
					href: "",
					label: "CSS",
					icon: FaCss3,
					submenus: [
						{
							href: "/posts",
							label: "All Posts",
						},
						{
							href: "/posts/new",
							label: "New Post",
						},
						{
							href: "/posts",
							label: "All Posts",
						},
						{
							href: "/posts/new",
							label: "New Post",
						},
					],
				},
				{
					href: "",
					label: "Javascript",
					icon: DiJavascript1,
					submenus: [
						{
							href: "/posts",
							label: "All Posts",
						},
						{
							href: "/posts/new",
							label: "New Post",
						},
						{
							href: "/posts",
							label: "All Posts",
						},
						{
							href: "/posts/new",
							label: "New Post",
						},
					],
				},
				{
					href: "/categories",
					label: "React",
					icon: FaReact,
					submenus: [
						{
							href: "/posts",
							label: "All Posts",
						},
						{
							href: "/posts/new",
							label: "New Post",
						},
					],
				},
				{
					href: "/categories",
					label: "System Design (HLD)",
					icon: FaSitemap,
					submenus: [
						{
							href: "/posts",
							label: "All Posts",
						},
						{
							href: "/posts/new",
							label: "New Post",
						},
					],
				},
				{
					href: "/categories",
					label: "System Design (LLD)",
					icon: FaProjectDiagram,
					submenus: [
						{
							href: "/posts",
							label: "All Posts",
						},
						{
							href: "/posts/new",
							label: "New Post",
						},
					],
				},
			],
		},
		{
			groupLabel: "Settings",
			menus: [
				{
					href: "/users",
					label: "Users",
					icon: Users,
				},
				{
					href: "/account",
					label: "Account",
					icon: Settings,
				},
			],
		},
	],
};

export function getSidebarConfig(): SidebarConfigType {
	return SidebarConfig;
}
