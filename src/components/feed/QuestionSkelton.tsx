import { Skeleton } from "@/components/ui/skeleton";

export function QuestionSkeleton() {
	return (
		<div className="flex items-center gap-4 justify-between min-h-22 md:min-h-26 border rounded-lg shadow p-4">
			{/* Left: Completion Icon and Title */}
			<div className="flex gap-2 items-center flex-1">
				<Skeleton className="h-5 w-5 rounded-full" />
				<Skeleton className="h-5 w-[80%]" />
			</div>
			{/* Right: Difficulty and Views */}
			<div className="flex gap-4 md:gap-8">
				<Skeleton className="h-6 w-16 rounded" />
				<Skeleton className="h-6 w-12 rounded" />
			</div>
		</div>
	);
}
