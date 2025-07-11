import { TemplateFramework } from "@/db/schema/enums";
import { FaReact, FaVuejs, FaAngular, FaJs } from "react-icons/fa";
import { SiNextdotjs, SiSvelte, SiJavascript } from "react-icons/si";
import { IconType } from "react-icons";

// Framework icons mapping using React Icons
export const FRAMEWORK_ICONS: Record<TemplateFramework, IconType> = {
	REACT: FaReact,
	NEXTJS: SiNextdotjs,
	VANILLAJS: FaJs,
	VUE: FaVuejs,
	ANGULAR: FaAngular,
	SVELTEKIT: SiSvelte,
	JAVASCRIPT: SiJavascript,
};
