import {
	Tooltip,
	TooltipProvider,
	TooltipTrigger,
	TooltipContent,
} from "../ui/tooltip";
import { Flame } from "lucide-react";

export const ViewsBadge = ({
	views,
	showTitle = false,
}: { views: number; showTitle?: boolean }) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center justify-center gap-1 cursor-pointer">
						<Flame size={18} className="text-orange-500" />
						<span className="font-medium text-sm capitalize flex gap-1">
							{views}
							{showTitle && <span className="hidden sm:block">views</span>}
						</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>Views</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
