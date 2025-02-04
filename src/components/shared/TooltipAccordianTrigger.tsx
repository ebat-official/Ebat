import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

const TooltipAccordianTrigger = ({
	label,
	icon,
}: { label: string; icon: React.ReactNode }) => (
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="flex items-center justify-center gap-1">
					<span>{label}</span>
					{icon}
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p>{label} selection</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);

export default TooltipAccordianTrigger;
