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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Trash2, RefreshCw, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useServerAction } from "@/hooks/useServerAction";
import { deleteSubmission } from "@/actions/submission";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmissionStatus } from "@prisma/client";
import {
	SubmissionWithStatus,
	SubmissionSortField,
	SubmissionSortOrder,
} from "@/utils/types";

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
	const [sortField, setSortField] =
		useState<SubmissionSortField>("submittedAt");
	const [sortOrder, setSortOrder] = useState<SubmissionSortOrder>("desc");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(
		null,
	);
	const queryClient = useQueryClient();

	const handleSort = (field: SubmissionSortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortOrder("desc");
		}
	};

	const openDeleteDialog = (submissionId: string) => {
		setSubmissionToDelete(submissionId);
		setIsDeleteDialogOpen(true);
	};

	const handleDelete = async () => {
		if (!submissionToDelete) return;

		try {
			const result = await deleteSubmissionAction(submissionToDelete);
			if (result.status === "success") {
				toast.success("Submission deleted successfully");
				// Invalidate and refetch submissions
				queryClient.invalidateQueries({ queryKey: ["submissions", postId] });
				// Close dialog only on success
				setIsDeleteDialogOpen(false);
				setSubmissionToDelete(null);
			} else {
				toast.error(result.data?.message || "Failed to delete submission");
				// Keep dialog open on error so user can try again or cancel
			}
		} catch (error) {
			toast.error("An error occurred while deleting the submission");
			// Keep dialog open on error so user can try again or cancel
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
				case "status": {
					// For status sorting, we want ACCEPTED to come before REJECTED
					// Convert enum to numeric value for proper sorting
					const statusOrder = { ACCEPTED: 1, REJECTED: 2 };
					aValue =
						statusOrder[(a as SubmissionWithStatus).status] ||
						statusOrder.REJECTED;
					bValue =
						statusOrder[(b as SubmissionWithStatus).status] ||
						statusOrder.REJECTED;
					break;
				}
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
								onClick={() => handleSort("status")}
							>
								<div className="flex items-center gap-1">
									Status
									<ArrowUpDown className="w-3 h-3" />
								</div>
							</TableHead>
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
									<Badge
										variant={
											(submission as SubmissionWithStatus).status ===
											SubmissionStatus.ACCEPTED
												? "default"
												: "destructive"
										}
									>
										{(submission as SubmissionWithStatus).status ||
											SubmissionStatus.REJECTED}
									</Badge>
								</TableCell>
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
											onClick={() => openDeleteDialog(submission.id)}
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

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your
							submission and remove it from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeletingSubmission}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeletingSubmission ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
