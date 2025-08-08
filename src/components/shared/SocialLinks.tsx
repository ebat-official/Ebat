import React from "react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { SOCIAL_LINKS } from "@/config";

export const SocialLinks: React.FC = () => {
	const handleSocialClick = (url: string) => {
		window.open(url, "_blank", "noopener,noreferrer");
	};

	return (
		<div className="flex items-center">
			<button
				type="button"
				onClick={() => handleSocialClick(SOCIAL_LINKS.DISCORD)}
				className="p-2 text-gray-600 hover:text-[#5865F2] dark:text-gray-400 dark:hover:text-[#5865F2] transition-colors duration-200"
				aria-label="Join Discord"
			>
				<FaDiscord size={18} />
			</button>
			<button
				type="button"
				onClick={() => handleSocialClick(SOCIAL_LINKS.GITHUB)}
				className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
				aria-label="View on GitHub"
			>
				<FaGithub size={18} />
			</button>
		</div>
	);
};
