"use client";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useSubmissions } from "@/hooks/query/useSubmissions";
import React, { useState } from "react";

import { deleteSubmission } from "@/actions/submission";
import LoginModal from "@/components/auth/LoginModal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmissionStatus } from "@/db/schema/enums";
import { useServerAction } from "@/hooks/useServerAction";
import {
	SubmissionSortField,
	SubmissionSortOrder,
	SubmissionWithStatus,
} from "@/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
	ArrowUpDown,
	Copy,
	MoreHorizontal,
	RefreshCw,
	Trash2,
} from "lucide-react";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import type { Template } from "../../playground/lib/types";
import { useWebContainerStore } from "../../playground/store/webContainer";
import { SUCCESS } from "@/utils/constants";

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
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
			if (result.status === SUCCESS) {
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

	const selectTemplate = useWebContainerStore((state) => state.selectTemplate);

	const handleCopyToEditor = async (submission: SubmissionWithStatus) => {
		try {
			if (!submission.answerTemplate) {
				toast.error("No answer template found in this submission");
				return;
			}

			// Convert the answerTemplate JSON to a Template object
			const answerTemplate = submission.answerTemplate as unknown as Template;

			// Use the webContainer store to select the template
			await selectTemplate(answerTemplate);

			toast.success("Template copied to editor successfully!");
		} catch (error) {
			console.error("Failed to copy template to editor:", error);
			toast.error("Failed to copy template to editor");
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
					const statusOrder = {
						[SubmissionStatus.ACCEPTED]: 1,
						[SubmissionStatus.REJECTED]: 2,
					};
					aValue =
						statusOrder[(a as SubmissionWithStatus).status] ||
						statusOrder[SubmissionStatus.REJECTED];
					bValue =
						statusOrder[(b as SubmissionWithStatus).status] ||
						statusOrder[SubmissionStatus.REJECTED];
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

	// Show login prompt if user is not authenticated
	if (!currentUserId) {
		return (
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-semibold">My Submissions</h3>
				</div>
				<div className="border rounded-lg p-8">
					<div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
						<LogIn className="w-12 h-12 mb-4 text-muted-foreground/50" />
						<div className="text-center">
							<p className="text-lg font-medium mb-2">
								Sign in to view submissions
							</p>
							<p className="text-sm mb-4">
								You need to be signed in to view and manage your submissions
							</p>
							<Button
								onClick={() => setIsLoginModalOpen(true)}
								className="gap-2"
							>
								<LogIn className="w-4 h-4" />
								Sign In
							</Button>
						</div>
					</div>
				</div>
				{isLoginModalOpen && (
					<LoginModal
						dialogTrigger={false}
						closeHandler={() => setIsLoginModalOpen(false)}
					/>
				)}
			</div>
		);
	}

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

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">
					My Submissions ({submissions?.length || 0})
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

			{!submissions || submissions.length === 0 ? (
				<div className="border rounded-lg p-8">
					<div className="flex items-center justify-center h-32 text-muted-foreground">
						<div className="text-center">
							<p className="text-lg font-medium">No submissions yet</p>
							<p className="text-sm mt-2">Your submissions will appear here</p>
						</div>
					</div>
				</div>
			) : (
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
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													disabled={isDeletingSubmission}
													className="h-8 w-8 p-0"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => handleCopyToEditor(submission)}
													className="cursor-pointer"
												>
													<Copy className="mr-2 h-4 w-4" />
													Copy to Editor
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => openDeleteDialog(submission.id)}
													className="cursor-pointer text-destructive focus:text-destructive"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

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
