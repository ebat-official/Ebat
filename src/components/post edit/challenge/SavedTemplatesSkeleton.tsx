import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const SavedTemplatesSkeleton: React.FC = () => {
	return (
		<div className="mt-4">
			<div className="flex items-center gap-2 mb-3">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-4 rounded-full" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<div
						key={index}
						className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
					>
						<div className="flex items-center gap-3">
							<Skeleton className="w-6 h-6 rounded" />
							<div className="space-y-1">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-3 w-16" />
							</div>
						</div>
						<div className="flex items-center gap-1">
							<Skeleton className="h-8 w-8 rounded" />
							<Skeleton className="h-8 w-8 rounded" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default SavedTemplatesSkeleton;
