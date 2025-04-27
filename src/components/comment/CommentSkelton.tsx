import { Skeleton } from "@/components/ui/skeleton";

export function CommentSkeleton() {
	return (
		<div className="space-y-3 p-4 border rounded-lg">
			<div className="flex items-center space-x-2">
				<Skeleton className="h-8 w-8 rounded-full" />
				<div className="space-y-1 flex gap-2 items-center">
					<Skeleton className="h-4 w-[120px]" />
					<Skeleton className="h-3 w-[80px]" />
				</div>
			</div>
			<div className="space-y-4 pl-10">
				<Skeleton className="h-5 w-[80%]" />
				<div className="flex space-x-4">
					<Skeleton className="h-4 w-[60px]" />
					<Skeleton className="h-4 w-[60px]" />
				</div>
			</div>
		</div>
	);
}
