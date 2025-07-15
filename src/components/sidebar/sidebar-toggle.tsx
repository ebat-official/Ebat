import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
	isOpen: boolean | undefined;
	setIsOpen?: () => void;
	className?: string; // Accept additional classes
}

export function SidebarToggle({
	isOpen,
	setIsOpen,
	className,
}: SidebarToggleProps) {
	return (
		<div
			className={cn(
				className, // Merge additional classes
			)}
		>
			<Button
				onClick={() => setIsOpen?.()}
				className="rounded-md w-8 h-8"
				variant="outline"
				size="icon"
			>
				<ChevronLeft
					className={cn(
						"h-4 w-4 transition-transform ease-in-out duration-700",
						isOpen === false ? "rotate-180" : "rotate-0",
					)}
				/>
			</Button>
		</div>
	);
}
