"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDraftApproval } from "@/hooks/query/useApprovalPosts";
import { useEditApproval } from "@/hooks/query/useEditApproval";
import { FileText, Edit, Eye, MoreHorizontal, Check, X } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import {
	approvalColumnConfig,
	approvalCategoryColumns,
	approvalDefaultColumns,
	APPROVAL_CONSTANTS,
} from "./approvalConstants";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { PostWithAuthor, PostEditWithAuthor } from "./types";
import { renderPostCell, renderEditCell } from "./approvalUtils";
import { generatePreviewUrl } from "@/utils/generatePreviewUrl";
import { useSession } from "@/lib/auth-client";
import { hasModeratorAccess } from "@/auth/roleUtils";
import { UserRole } from "@/db/schema/enums";
import {
	approvePostEdit,
	rejectPostEdit,
	approvePost,
	rejectPost,
} from "@/actions/approval";
import { toast } from "sonner";
import { SUCCESS } from "@/utils/constants";
import { ApprovalsLockedScreen } from "./ApprovalsLockedScreen";
import { Skeleton } from "@/components/ui/skeleton";

// Loading Skeleton Component
function ApprovalsLoadingSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<Skeleton className="h-8 w-48" />
				<div className="flex gap-2">
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-6 w-24" />
				</div>
			</div>

			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="flex items-center justify-between p-4 border rounded-lg"
						>
							<div className="flex items-center gap-3">
								<Skeleton className="h-4 w-4 rounded" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-48" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
							<Skeleton className="h-6 w-12 rounded" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function ApprovalsPage() {
	const { data: session, isPending } = useSession();
	const canApproveReject =
		session && hasModeratorAccess(session.user.role as UserRole);

	// Show loading state while session is loading
	if (isPending) {
		return <ApprovalsLoadingSkeleton />;
	}

	// Show locked screen if user is not authenticated or doesn't have moderator access
	if (!session || !canApproveReject) {
		return <ApprovalsLockedScreen />;
	}

	// Separate state for posts tab
	const [postsSearchQuery, setPostsSearchQuery] = useState("");
	const [postsSortField, setPostsSortField] = useState<string>("createdAt");
	const [postsSortOrder, setPostsSortOrder] = useState<"asc" | "desc">("desc");
	const [postsFilters, setPostsFilters] = useState<Record<string, string>>({});
	const [postsCurrentPage, setPostsCurrentPage] = useState(1);
	const [postsPageSize] = useState(10);

	// Separate state for edits tab
	const [editsSearchQuery, setEditsSearchQuery] = useState("");
	const [editsSortField, setEditsSortField] = useState<string>("createdAt");
	const [editsSortOrder, setEditsSortOrder] = useState<"asc" | "desc">("desc");
	const [editsFilters, setEditsFilters] = useState<Record<string, string>>({});
	const [editsCurrentPage, setEditsCurrentPage] = useState(1);
	const [editsPageSize] = useState(10);

	// Approve/Reject state
	const [approveDialogOpen, setApproveDialogOpen] = useState(false);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [rejectReasonDialogOpen, setRejectReasonDialogOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const [selectedEditId, setSelectedEditId] = useState<string | null>(null);
	const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// Separate queries for each tab
	const {
		data: postsData,
		isLoading: postsLoading,
		error: postsError,
		refetch: refetchPosts,
	} = useDraftApproval({
		searchQuery: postsSearchQuery,
		sortField: postsSortField as string,
		sortOrder: postsSortOrder,
		filters: {
			category: postsFilters.category || "",
			subcategory: postsFilters.subcategory || "",
			type: postsFilters.type || "",
			difficulty: postsFilters.difficulty || "",
			companies: [],
			topics: [],
		},
		page: postsCurrentPage,
		pageSize: postsPageSize,
	});

	const {
		data: editsData,
		isLoading: editsLoading,
		error: editsError,
		refetch: refetchEdits,
	} = useEditApproval({
		searchQuery: editsSearchQuery,
		sortField: editsSortField as string,
		sortOrder: editsSortOrder,
		filters: {
			category: editsFilters.category || "",
			subcategory: editsFilters.subcategory || "",
			type: editsFilters.type || "",
			difficulty: editsFilters.difficulty || "",
			companies: [],
			topics: [],
		},
		page: editsCurrentPage,
		pageSize: editsPageSize,
	});

	if (postsError) {
		return (
			<div className="flex items-center justify-center p-8 text-destructive">
				Error loading pending posts: {postsError.message}
			</div>
		);
	}

	if (editsError) {
		return (
			<div className="flex items-center justify-center p-8 text-destructive">
				Error loading pending edits: {editsError.message}
			</div>
		);
	}

	const { posts = [], pagination: postsPagination } = postsData || {};
	const { postEdits = [], pagination: editsPagination } = editsData || {};
	const { totalPosts = 0, totalPages: postsTotalPages = 1 } =
		postsPagination || {};
	const { totalEdits = 0, totalPages: editsTotalPages = 1 } =
		editsPagination || {};

	const handlePostsPageChange = (page: number) => {
		setPostsCurrentPage(page);
	};

	const handleEditsPageChange = (page: number) => {
		setEditsCurrentPage(page);
	};

	// Approve/Reject handlers
	const handleApprove = async () => {
		if (!selectedEditId && !selectedPostId) return;

		setIsProcessing(true);
		try {
			if (selectedEditId) {
				const result = await approvePostEdit(selectedEditId);
				if (result.status === SUCCESS) {
					toast.success("Post edit approved successfully!");
				} else {
					toast.error(result.data.message || "Failed to approve post edit");
				}
			} else if (selectedPostId) {
				const result = await approvePost(selectedPostId);
				if (result.status === SUCCESS) {
					toast.success("Post approved successfully!");
				} else {
					toast.error(result.data.message || "Failed to approve post");
				}
			}

			// Refetch data instead of full page reload
			await Promise.all([refetchPosts(), refetchEdits()]);
		} catch (error) {
			toast.error("An error occurred while approving");
		} finally {
			setIsProcessing(false);
			setApproveDialogOpen(false);
			setSelectedEditId(null);
			setSelectedPostId(null);
		}
	};

	const handleReject = async () => {
		if (!selectedEditId && !selectedPostId) return;

		setIsProcessing(true);
		try {
			if (selectedEditId) {
				const result = await rejectPostEdit(selectedEditId, rejectReason);
				if (result.status === SUCCESS) {
					toast.success("Post edit rejected successfully!");
				} else {
					toast.error(result.data.message || "Failed to reject post edit");
				}
			} else if (selectedPostId) {
				const result = await rejectPost(selectedPostId, rejectReason);
				if (result.status === SUCCESS) {
					toast.success("Post rejected successfully!");
				} else {
					toast.error(result.data.message || "Failed to reject post");
				}
			}

			// Refetch data instead of full page reload
			await Promise.all([refetchPosts(), refetchEdits()]);
		} catch (error) {
			toast.error("An error occurred while rejecting");
		} finally {
			setIsProcessing(false);
			setRejectDialogOpen(false);
			setRejectReasonDialogOpen(false);
			setRejectReason("");
			setSelectedEditId(null);
			setSelectedPostId(null);
		}
	};

	const openApproveDialog = (id: string, isPost = false) => {
		if (isPost) {
			setSelectedPostId(id);
		} else {
			setSelectedEditId(id);
		}
		setApproveDialogOpen(true);
	};

	const openRejectDialog = (id: string, isPost = false) => {
		if (isPost) {
			setSelectedPostId(id);
		} else {
			setSelectedEditId(id);
		}
		setRejectReasonDialogOpen(true);
	};

	const renderPostActions = (post: PostWithAuthor) => {
		const previewUrl = generatePreviewUrl({
			category: post.category,
			subCategory: post.subCategory,
			postType: post.type,
			postId: post.id,
			userId: post.author?.id,
		});

		return (
			<div className="flex gap-2">
				<Button
					size="sm"
					variant="outline"
					onClick={() => window.open(previewUrl, "_blank")}
				>
					<Eye className="h-4 w-4" />
				</Button>
				{canApproveReject && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="sm" variant="outline">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => openApproveDialog(post.id, true)}
							>
								<Check className="h-4 w-4 mr-2" />
								Approve
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => openRejectDialog(post.id, true)}>
								<X className="h-4 w-4 mr-2" />
								Reject
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		);
	};

	const renderEditActions = (edit: PostEditWithAuthor) => {
		const previewUrl = generatePreviewUrl({
			category: edit.category,
			subCategory: edit.subCategory,
			postType: edit.type,
			postId: edit.postId,
			edited: true,
			userId: edit.author?.id,
			diffview: true,
		});

		return (
			<div className="flex gap-2">
				<Button
					size="sm"
					variant="outline"
					onClick={() => window.open(previewUrl, "_blank")}
				>
					<Eye className="h-4 w-4" />
				</Button>
				{canApproveReject && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="sm" variant="outline">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => openApproveDialog(edit.id, false)}
							>
								<Check className="h-4 w-4 mr-2" />
								Approve
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => openRejectDialog(edit.id, false)}
							>
								<X className="h-4 w-4 mr-2" />
								Reject
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">
					{APPROVAL_CONSTANTS.TITLES.CONTENT_APPROVALS}
				</h2>
				<div className="flex gap-2">
					<Badge variant="outline">
						{totalPosts} {APPROVAL_CONSTANTS.BADGE_LABELS.PENDING_POSTS}
					</Badge>
					<Badge variant="outline">
						{totalEdits} {APPROVAL_CONSTANTS.BADGE_LABELS.PENDING_EDITS}
					</Badge>
				</div>
			</div>

			<Tabs defaultValue={APPROVAL_CONSTANTS.TABS.POSTS} className="space-y-4">
				<TabsList>
					<TabsTrigger
						value={APPROVAL_CONSTANTS.TABS.POSTS}
						className="flex items-center gap-2"
					>
						<FileText className="h-4 w-4" />
						{APPROVAL_CONSTANTS.TITLES.NEW_POSTS} ({totalPosts})
					</TabsTrigger>
					<TabsTrigger
						value={APPROVAL_CONSTANTS.TABS.EDITS}
						className="flex items-center gap-2"
					>
						<Edit className="h-4 w-4" />
						{APPROVAL_CONSTANTS.TITLES.POST_EDITS} ({totalEdits})
					</TabsTrigger>
				</TabsList>

				<TabsContent value={APPROVAL_CONSTANTS.TABS.POSTS}>
					<DataTable<PostWithAuthor>
						data={posts}
						loading={postsLoading}
						columns={approvalColumnConfig}
						categoryColumns={approvalCategoryColumns}
						defaultColumns={approvalDefaultColumns}
						searchQuery={postsSearchQuery}
						setSearchQuery={setPostsSearchQuery}
						sortField={postsSortField}
						sortOrder={postsSortOrder}
						setSortField={setPostsSortField}
						setSortOrder={setPostsSortOrder}
						renderCell={renderPostCell}
						renderActions={renderPostActions}
						title={APPROVAL_CONSTANTS.TITLES.NEW_POSTS}
						emptyMessage={APPROVAL_CONSTANTS.EMPTY_MESSAGES.NO_PENDING_POSTS}
						loadingMessage={APPROVAL_CONSTANTS.LOADING_MESSAGES.POSTS}
						searchPlaceholder={APPROVAL_CONSTANTS.SEARCH_PLACEHOLDERS.POSTS}
						filters={postsFilters}
						setFilters={setPostsFilters}
						// Pagination props
						currentPage={postsCurrentPage}
						pageSize={postsPageSize}
						totalItems={totalPosts}
						totalPages={postsTotalPages}
						onPageChange={handlePostsPageChange}
						showPagination={true}
					/>
				</TabsContent>

				<TabsContent value={APPROVAL_CONSTANTS.TABS.EDITS}>
					<DataTable<PostEditWithAuthor>
						data={postEdits}
						loading={editsLoading}
						columns={approvalColumnConfig}
						categoryColumns={approvalCategoryColumns}
						defaultColumns={approvalDefaultColumns}
						searchQuery={editsSearchQuery}
						setSearchQuery={setEditsSearchQuery}
						sortField={editsSortField}
						sortOrder={editsSortOrder}
						setSortField={setEditsSortField}
						setSortOrder={setEditsSortOrder}
						renderCell={renderEditCell}
						renderActions={renderEditActions}
						title={APPROVAL_CONSTANTS.TITLES.POST_EDITS}
						emptyMessage={APPROVAL_CONSTANTS.EMPTY_MESSAGES.NO_PENDING_EDITS}
						loadingMessage={APPROVAL_CONSTANTS.LOADING_MESSAGES.EDITS}
						searchPlaceholder={APPROVAL_CONSTANTS.SEARCH_PLACEHOLDERS.EDITS}
						filters={editsFilters}
						setFilters={setEditsFilters}
						// Pagination props
						currentPage={editsCurrentPage}
						pageSize={editsPageSize}
						totalItems={totalEdits}
						totalPages={editsTotalPages}
						onPageChange={handleEditsPageChange}
						showPagination={true}
					/>
				</TabsContent>
			</Tabs>

			{/* Approve Confirmation Dialog */}
			<AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{selectedPostId ? "Approve Post" : "Approve Post Edit"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{selectedPostId
								? "Are you sure you want to approve this post? This will make it visible to all users."
								: "Are you sure you want to approve this post edit? This will update the original post with the edited content and add the edit author as a contributor."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isProcessing}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleApprove}
							disabled={isProcessing}
							className="bg-green-600 hover:bg-green-700"
						>
							{isProcessing ? "Approving..." : "Approve"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Reject Confirmation Dialog */}
			<AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{selectedPostId ? "Reject Post" : "Reject Post Edit"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to reject this{" "}
							{selectedPostId ? "post" : "post edit"}? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isProcessing}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleReject}
							disabled={isProcessing}
							className="bg-red-600 hover:bg-red-700"
						>
							{isProcessing ? "Rejecting..." : "Reject"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Reject Reason Dialog */}
			<Dialog
				open={rejectReasonDialogOpen}
				onOpenChange={setRejectReasonDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedPostId ? "Reject Post" : "Reject Post Edit"}
						</DialogTitle>
						<DialogDescription>
							Please provide a reason for rejecting this{" "}
							{selectedPostId ? "post" : "post edit"}. This will be shown to the
							user for improving the content and publishing again.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Textarea
							placeholder="Enter rejection reason..."
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value.slice(0, 300))}
							className="min-h-[100px]"
							maxLength={300}
						/>
						<div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
							<span>{rejectReason.length}/300 characters</span>
							<span>
								{rejectReason.length < 4 ? "atleast 4 characters" : ""}
							</span>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setRejectReasonDialogOpen(false);
								setRejectReason("");
							}}
							disabled={isProcessing}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleReject}
							disabled={isProcessing || rejectReason.length < 4}
						>
							{isProcessing ? "Rejecting..." : "Reject"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
