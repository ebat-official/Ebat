import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const TooltipAccordianTrigger = ({
	label,
	icon,
}: {
	label: string;
	icon: React.ReactNode;
}) => (
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
);

export default TooltipAccordianTrigger;
