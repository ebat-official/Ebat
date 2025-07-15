import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import React from "react";

interface PostContentSkeletonProps {
	lines?: number;
	className?: string;
}

const widthOptions = ["w-full", "w-[90%]", "w-3/4", "w-2/4"];

const PostContentSkeleton: React.FC<PostContentSkeletonProps> = ({
	lines = 5,
	className,
}) => {
	return (
		<div className={cn("h-full flex flex-col gap-2", className)}>
			{[...Array(lines)].map((_, index) => (
				<Skeleton
					key={index}
					className={cn("ml-6 h-5", widthOptions[index % widthOptions.length])}
				/>
			))}
		</div>
	);
};

export default PostContentSkeleton;
