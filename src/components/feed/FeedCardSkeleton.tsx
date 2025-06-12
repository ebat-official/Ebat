import { Skeleton } from "../ui/skeleton";

export const FeedCardSkeleton = () => (
	<div className="block overflow-hidden">
		<div className="relative pb-2">
			<div className="flex flex-col gap-4 h-92 justify-between p-4">
				<Skeleton className="h-6 w-3/4 rounded" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-8 rounded-full" />
					<div className="flex flex-col w-28 gap-1">
						<Skeleton className="h-4 w-3/4 rounded" />
						<Skeleton className="h-3 w-1/2 rounded" />
					</div>
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-5 w-16 rounded-full" />
					<Skeleton className="h-5 w-12 rounded-full" />
					<Skeleton className="h-5 w-8 rounded-full" />
				</div>
				<Skeleton className="w-full h-40 rounded-md" />
				<div className="flex justify-between items-center mt-2">
					<Skeleton className="h-5 w-12 rounded" />
					<Skeleton className="h-8 w-8 rounded-full" />
					<Skeleton className="h-8 w-8 rounded-full" />
					<Skeleton className="h-8 w-8 rounded-full" />
				</div>
				<span className="absolute right-2 top-2">
					<Skeleton className="h-5 w-5 rounded-full" />
				</span>
			</div>
		</div>
	</div>
);
