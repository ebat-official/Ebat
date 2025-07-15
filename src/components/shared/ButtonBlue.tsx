import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React, { FC, ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string;
	title?: string;
	loading?: boolean;
	children?: ReactNode;
	loadingText?: string;
}

const ButtonBlue: FC<ButtonProps> = ({
	className,
	title,
	loading = false,
	loadingText = "Please wait",
	children,
	...others
}) => {
	return (
		<button
			className={cn(
				"flex flex-col justify-center items-center px-6 py-3 mb-0 text-xs font-bold text-center text-white capitalize align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer shadow-soft-md bg-x-25 bg-150 leading-pro ease-soft-in tracking-tight-soft bg-linear-to-tl blue-gradient hover:scale-102 hover:shadow-soft-xs active:opacity-85 disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			disabled={loading}
			{...others}
		>
			<div className="flex items-center">
				{!loading && title}
				{children && !loading && <>{children}</>}
				<Loader2
					className={cn("ml-2 h-4 w-4 animate-spin", { hidden: !loading })}
				/>
				{loading && loadingText}
			</div>
		</button>
	);
};

export default ButtonBlue;
