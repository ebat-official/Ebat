import { TemplateFramework } from "@/db/schema/enums";
import { IconType } from "react-icons";
import { FaAngular, FaJs, FaReact, FaVuejs } from "react-icons/fa";
import { SiJavascript, SiNextdotjs, SiSvelte } from "react-icons/si";

// Framework icons mapping using React Icons
export const FRAMEWORK_ICONS: Record<TemplateFramework, IconType> = {
	react: FaReact,
	nextjs: SiNextdotjs,
	vanillajs: FaJs,
	vue: FaVuejs,
	angular: FaAngular,
	sveltekit: SiSvelte,
	javascript: SiJavascript,
};
