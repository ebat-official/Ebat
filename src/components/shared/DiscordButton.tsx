import React from "react";
import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";
import { ExternalLink } from "lucide-react";

interface DiscordButtonProps {
	className?: string;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg";
}

export const DiscordButton: React.FC<DiscordButtonProps> = ({
	className = "",
	variant = "default",
	size = "default",
}) => {
	const handleDiscordClick = () => {
		window.open(
			"https://discord.gg/UKNCtK7Y5x",
			"_blank",
			"noopener,noreferrer",
		);
	};

	return (
		<Button
			onClick={handleDiscordClick}
			variant={variant}
			size={size}
			className={`gap-2  blue-gradient hover:bg-[#4752C4] text-white border-[#5865F2] hover:border-[#4752C4] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${className}`}
		>
			<FaDiscord size={16} />
			<span className="font-semibold">Join Discord</span>
		</Button>
	);
};
