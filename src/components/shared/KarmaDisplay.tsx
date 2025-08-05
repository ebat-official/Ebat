import { cn } from "@/lib/utils";

interface KarmaDisplayProps {
	karma?: number;
	showLabel?: boolean;
	className?: string;
}

export const KarmaDisplay = ({
	karma = 0,
	showLabel = true,
	className = "",
}: KarmaDisplayProps) => {
	return (
		<div className={cn("flex items-center gap-1", className)}>
			<span className="text-orange-500 text-lg">▲</span>
			<span className="font-medium text-sm">{karma.toLocaleString()}</span>
			{showLabel && (
				<span className="text-xs text-muted-foreground">karma</span>
			)}
		</div>
	);
};
