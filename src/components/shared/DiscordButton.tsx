import React from "react";
import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";
import { ExternalLink } from "lucide-react";
import { SOCIAL_LINKS } from "@/config";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface DiscordButtonProps {
	className?: string;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg";
	isOpen?: boolean;
}

export const DiscordButton: React.FC<DiscordButtonProps> = ({
	className = "",
	variant = "default",
	size = "default",
	isOpen = true,
}) => {
	const handleDiscordClick = () => {
		window.open(SOCIAL_LINKS.DISCORD, "_blank", "noopener,noreferrer");
	};

	return (
		<TooltipProvider disableHoverableContent>
			<Tooltip delayDuration={100}>
				<TooltipTrigger asChild>
					<Button
						onClick={handleDiscordClick}
						variant={variant}
						size={size}
						className={`gap-2 relative blue-gradient hover:bg-[#4752C4] text-white border-[#5865F2] hover:border-[#4752C4] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${className}`}
					>
						<FaDiscord
							size={16}
							className={cn(
								isOpen === false
									? "absolute left-1/2 -translate-x-1/2"
									: "mr-2",
							)}
						/>
						<span
							className={cn(
								"font-semibold",
								isOpen === false
									? "-translate-x-96 opacity-0"
									: "translate-x-0 opacity-100",
							)}
						>
							Join Discord
						</span>
					</Button>
				</TooltipTrigger>
				{isOpen === false && (
					<TooltipContent side="right">Join Discord</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
};
