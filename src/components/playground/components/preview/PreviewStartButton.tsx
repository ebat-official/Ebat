import { Eye } from "lucide-react";
import React, { FC, useState } from "react";

interface PreviewStartButtonProps {
	onStart: () => void;
}

export const PreviewStartButton: FC<PreviewStartButtonProps> = ({
	onStart,
}) => {
	const [isClicked, setIsClicked] = useState(false);

	const handleClick = () => {
		setIsClicked(true);
		// Add a small delay for the animation before calling onStart
		setTimeout(() => {
			onStart();
		}, 300);
	};

	return (
		<div className="h-full flex items-center justify-center bg-transparent">
			<button
				type="button"
				onClick={handleClick}
				disabled={isClicked}
				className={`
					relative group
					flex items-center justify-center
					w-16 h-16 rounded-full
					bg-linear-to-tl from-blue-500 to-purple-600
					transform transition-all duration-300 ease-out
					hover:scale-110 hover:shadow-2xl
					active:scale-95
					disabled:cursor-not-allowed
                    cursor-pointer
					${
						isClicked
							? "animate-pulse scale-125 shadow-2xl"
							: "hover:animate-pulse"
					}
				`}
			>
				{/* Ripple effect on click */}
				{isClicked && (
					<div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
				)}

				{/* Eye icon with animation */}
				<Eye
					className={`
						w-10 h-10 text-white
						transition-all duration-300
						${
							isClicked
								? "scale-150 rotate-12"
								: "group-hover:scale-125 group-hover:rotate-6"
						}
					`}
				/>

				{/* Glowing background effect */}
				<div className="absolute inset-0 rounded-full bg-linear-to-tl from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse" />
			</button>

			{/* Optional text below button */}
			<div className="absolute mt-32 text-center">
				<p className="text-sm text-muted-foreground font-medium">
					{isClicked ? "Loading Preview..." : "Click to Show Preview"}
				</p>
			</div>
		</div>
	);
};
