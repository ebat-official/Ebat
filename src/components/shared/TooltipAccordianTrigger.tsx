import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const TooltipAccordianTrigger = ({
	label,
	icon,
	tooltipContent = label,
}: {
	label: string;
	icon: React.ReactNode;
	tooltipContent?: string;
}) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<div className="flex items-center justify-center gap-1">
				{icon}
				<span>{label}</span>
			</div>
		</TooltipTrigger>
		<TooltipContent>
			<p>{tooltipContent}</p>
		</TooltipContent>
	</Tooltip>
);

export default TooltipAccordianTrigger;
