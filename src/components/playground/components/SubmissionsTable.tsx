import React, { useState } from "react";
import { useSubmissions } from "@/hooks/query/useSubmissions";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Trash2, RefreshCw, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useServerAction } from "@/hooks/useServerAction";
import { deleteSubmission } from "@/actions/submission";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type SortField = "submittedAt" | "framework" | "runTime";
type SortOrder = "asc" | "desc";

interface SubmissionsTableProps {
	postId: string;
	currentUserId?: string;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
	postId,
	currentUserId,
}) => {
	const {
		data: submissions,
		isLoading,
		error,
		refetch,
		isFetching,
	} = useSubmissions(postId);
	const [deleteSubmissionAction, isDeletingSubmission] =
		useServerAction(deleteSubmission);
	const [sortField, setSortField] = useState<SortField>("submittedAt");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
	const queryClient = useQueryClient();

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortOrder("desc");
		}
	};

	const handleDelete = async (submissionId: string) => {
		if (!confirm("Are you sure you want to delete this submission?")) {
			return;
		}

		try {
			const result = await deleteSubmissionAction(submissionId);
			if (result.status === "success") {
				toast.success("Submission deleted successfully");
				// Invalidate and refetch submissions
				queryClient.invalidateQueries({ queryKey: ["submissions", postId] });
			} else {
				toast.error(result.data?.message || "Failed to delete submission");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the submission");
		}
	};

	const sortedSubmissions = React.useMemo(() => {
		if (!submissions) return [];

		return [...submissions].sort((a, b) => {
			let aValue: string | number | Date;
			let bValue: string | number | Date;

			switch (sortField) {
				case "submittedAt":
					aValue = new Date(a.submittedAt);
					bValue = new Date(b.submittedAt);
					break;
				case "framework":
					aValue = a.framework;
					bValue = b.framework;
					break;
				case "runTime":
					aValue = a.runTime;
					bValue = b.runTime;
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
			if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
			return 0;
		});
	}, [submissions, sortField, sortOrder]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-9 w-20" />
				</div>
				<div className="space-y-2">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-16 w-full" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
				<p>Failed to load submissions</p>
				<Button
					variant="outline"
					size="sm"
					onClick={() => refetch()}
					disabled={isFetching}
					className="mt-2"
				>
					<RefreshCw
						className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
					/>
					Retry
				</Button>
			</div>
		);
	}

	if (!submissions || submissions.length === 0) {
		return (
			<div className="flex items-center justify-center h-32 text-muted-foreground">
				<p>No submissions yet</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">
					Submissions ({submissions.length})
				</h3>
				<Button
					variant="outline"
					size="sm"
					onClick={() => refetch()}
					disabled={isFetching}
				>
					<RefreshCw
						className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
					/>
					Refresh
				</Button>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead
								className="cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort("framework")}
							>
								<div className="flex items-center gap-1">
									Language
									<ArrowUpDown className="w-3 h-3" />
								</div>
							</TableHead>
							<TableHead
								className="cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort("runTime")}
							>
								<div className="flex items-center gap-1">
									Runtime
									<ArrowUpDown className="w-3 h-3" />
								</div>
							</TableHead>
							<TableHead
								className="cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort("submittedAt")}
							>
								<div className="flex items-center gap-1">
									Submitted
									<ArrowUpDown className="w-3 h-3" />
								</div>
							</TableHead>
							<TableHead className="w-20">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedSubmissions.map((submission) => (
							<TableRow key={submission.id}>
								<TableCell>
									<Badge variant="secondary">{submission.framework}</Badge>
								</TableCell>
								<TableCell>
									{submission.runTime > 0 ? `${submission.runTime}ms` : "N/A"}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{formatDistanceToNow(new Date(submission.submittedAt), {
										addSuffix: true,
									})}
								</TableCell>
								<TableCell>
									{currentUserId === submission.userId && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(submission.id)}
											disabled={isDeletingSubmission}
											className="text-destructive hover:text-destructive"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};
