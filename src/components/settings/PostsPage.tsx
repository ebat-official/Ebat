"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserPosts } from "@/hooks/query/useUserPosts";
import { useUserPostEdits } from "@/hooks/query/useUserPostEdits";
import { FileText, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import {
	postsColumnConfig,
	postsCategoryColumns,
	postsDefaultColumns,
	POSTS_CONSTANTS,
} from "./postsConstants";
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
import { generatePreviewUrl } from "@/utils/generatePreviewUrl";
import { useSession } from "@/lib/auth-client";
import { deletePost, deletePostEdit } from "@/actions/post";
import { toast } from "sonner";
import { generatePostPath } from "@/utils/generatePostPath";
import { generateEditPath } from "@/utils/generateEditPath";
import { useRouter } from "next/navigation";
import {
	PostCategory,
	PostType,
	SubCategory,
	PostApprovalStatus,
	PostStatus,
} from "@/db/schema/enums";

interface PostWithAuthor {
	id: string;
	title: string | null;
	slug: string | null;
	authorId: string;
	type: PostType;
	category: PostCategory;
	subCategory: SubCategory;
	difficulty: string | null;
	companies: string[] | null;
	completionDuration: number | null;
	topics: string[] | null;
	coins: number | null;
	status: PostStatus;
	approvalStatus: PostApprovalStatus;
	createdAt: Date;
	updatedAt: Date;
	author: {
		id: string;
		name: string | null;
		username: string | null;
		email: string | null;
	};
}

interface PostEditWithAuthor {
	id: string;
	postId: string;
	title: string | null;
	authorId: string;
	type: PostType;
	category: PostCategory;
	subCategory: SubCategory;
	difficulty: string | null;
	companies: string[] | null;
	completionDuration: number | null;
	topics: string[] | null;
	status: PostStatus;
	approvalStatus: PostApprovalStatus;
	createdAt: Date;
	updatedAt: Date;
	author: {
		id: string;
		name: string | null;
		username: string | null;
		email: string | null;
	};
}

export function PostsPage() {
	const { data: session } = useSession();
	const router = useRouter();

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

	// Delete state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
	const [selectedPostEditId, setSelectedPostEditId] = useState<string | null>(
		null,
	);
	const [isDeletingPost, setIsDeletingPost] = useState(false);
	const [isDeletingEdit, setIsDeletingEdit] = useState(false);

	// Separate queries for each tab
	const {
		data: postsData,
		isLoading: postsLoading,
		error: postsError,
		refetch: refetchPosts,
	} = useUserPosts({
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
	} = useUserPostEdits({
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
				Error loading posts: {postsError.message}
			</div>
		);
	}

	if (editsError) {
		return (
			<div className="flex items-center justify-center p-8 text-destructive">
				Error loading post edits: {editsError.message}
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

	// Delete post handler
	const handleDeletePost = async () => {
		if (!selectedPostId) return;

		setIsDeletingPost(true);
		try {
			const result = await deletePost(selectedPostId);
			if (result.status === "success") {
				toast.success("Post deleted successfully!");
				// Refetch data instead of full page reload
				await Promise.all([refetchPosts(), refetchEdits()]);
			} else {
				toast.error(result.data.message || "Failed to delete post");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the post");
		} finally {
			setIsDeletingPost(false);
			setDeleteDialogOpen(false);
			setSelectedPostId(null);
		}
	};

	// Delete post edit handler
	const handleDeletePostEdit = async () => {
		if (!selectedPostEditId) return;

		setIsDeletingEdit(true);
		try {
			const result = await deletePostEdit(selectedPostEditId);
			if (result.status === "success") {
				toast.success("Post edit deleted successfully!");
				// Refetch data instead of full page reload
				await Promise.all([refetchPosts(), refetchEdits()]);
			} else {
				toast.error(result.data.message || "Failed to delete post edit");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the post edit");
		} finally {
			setIsDeletingEdit(false);
			setDeleteDialogOpen(false);
			setSelectedPostEditId(null);
		}
	};

	const openDeleteDialog = (postId: string) => {
		setSelectedPostId(postId);
		setSelectedPostEditId(null);
		setDeleteDialogOpen(true);
	};

	const openDeleteEditDialog = (postEditId: string) => {
		setSelectedPostEditId(postEditId);
		setSelectedPostId(null);
		setDeleteDialogOpen(true);
	};

	const handleEdit = (post: PostWithAuthor) => {
		const editPath = generateEditPath({
			category: post.category,
			subCategory: post.subCategory,
			postType: post.type,
			postId: post.id,
			approvalStatus: post.approvalStatus,
		});

		window.open(editPath, "_blank");
	};

	const handleView = (post: PostWithAuthor) => {
		const viewPath = generatePostPath({
			category: post.category,
			subCategory: post.subCategory,
			postType: post.type,
			slug: post.slug || "",
			id: post.id,
		});

		window.open(viewPath, "_blank");
	};

	const renderPostCell = (post: PostWithAuthor, column: string) => {
		switch (column) {
			case "title":
				return (
					<div className="font-medium">
						{post.title || POSTS_CONSTANTS.DEFAULTS.UNTITLED}
					</div>
				);
			case "author":
				return (
					<div className="text-sm text-muted-foreground">
						{post.author?.name ||
							post.author?.username ||
							POSTS_CONSTANTS.DEFAULTS.UNKNOWN_AUTHOR}
					</div>
				);
			case "category":
				return <div className="text-sm">{post.category}</div>;
			case "subcategory":
				return <div className="text-sm">{post.subCategory}</div>;
			case "type":
				return <div className="text-sm">{post.type}</div>;
			case "difficulty":
				return (
					<div className="text-sm">
						{post.difficulty || POSTS_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
					</div>
				);
			case "companies":
				return (
					<div className="text-sm">
						{post.companies && post.companies.length > 0
							? post.companies
									.slice(0, POSTS_CONSTANTS.DISPLAY_LIMITS.MAX_COMPANIES_SHOWN)
									.join(", ")
							: POSTS_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
					</div>
				);
			case "topics":
				return (
					<div className="text-sm">
						{post.topics && post.topics.length > 0
							? post.topics
									.slice(0, POSTS_CONSTANTS.DISPLAY_LIMITS.MAX_TOPICS_SHOWN)
									.join(", ")
							: POSTS_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
					</div>
				);
			case "completionDuration":
				return (
					<div className="text-sm">
						{post.completionDuration
							? `${post.completionDuration} min`
							: POSTS_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
					</div>
				);
			case "coins":
				return (
					<div className="text-sm">
						{post.coins
							? `${post.coins} coins`
							: POSTS_CONSTANTS.DEFAULTS.ZERO_COINS}
					</div>
				);
			case "createdAt":
				return (
					<div className="text-sm text-muted-foreground">
						{new Date(post.createdAt).toLocaleDateString()}
					</div>
				);
			case "updatedAt":
				return (
					<div className="text-sm text-muted-foreground">
						{new Date(post.updatedAt).toLocaleDateString()}
					</div>
				);
			case "status":
				return (
					<Badge
						variant={
							post.status === PostStatus.PUBLISHED ? "default" : "secondary"
						}
					>
						{post.status}
					</Badge>
				);
			case "approvalStatus":
				return (
					<Badge
						variant={
							post.approvalStatus === PostApprovalStatus.APPROVED
								? "default"
								: post.approvalStatus === PostApprovalStatus.PENDING
									? "secondary"
									: "destructive"
						}
						className={
							post.approvalStatus === PostApprovalStatus.APPROVED
								? "bg-green-600 hover:bg-green-700"
								: post.approvalStatus === PostApprovalStatus.PENDING
									? "bg-yellow-600 hover:bg-yellow-700"
									: "bg-red-600 hover:bg-red-700"
						}
					>
						{post.approvalStatus}
					</Badge>
				);
			default:
				return null;
		}
	};

	const renderEditCell = (edit: PostEditWithAuthor, column: string) => {
		switch (column) {
			case "title":
				return (
					<div className="font-medium">
						{edit.title || POSTS_CONSTANTS.DEFAULTS.UNTITLED}
					</div>
				);
			case "author":
				return (
					<div className="text-sm text-muted-foreground">
						{edit.author?.name ||
							edit.author?.username ||
							POSTS_CONSTANTS.DEFAULTS.UNKNOWN_AUTHOR}
					</div>
				);
			case "category":
				return <div className="text-sm">{edit.category}</div>;
			case "subcategory":
				return <div className="text-sm">{edit.subCategory}</div>;
			case "type":
				return <div className="text-sm">{edit.type}</div>;
			case "difficulty":
				return (
					<div className="text-sm">
						{edit.difficulty || POSTS_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
					</div>
				);
			case "companies":
				return (
					<div className="text-sm">
						{edit.companies && edit.companies.length > 0
							? edit.companies
									.slice(0, POSTS_CONSTANTS.DISPLAY_LIMITS.MAX_COMPANIES_SHOWN)
									.join(", ")
							: POSTS_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
					</div>
				);
			case "topics":
				return (
					<div className="text-sm">
						{edit.topics && edit.topics.length > 0
							? edit.topics
									.slice(0, POSTS_CONSTANTS.DISPLAY_LIMITS.MAX_TOPICS_SHOWN)
									.join(", ")
							: POSTS_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
					</div>
				);
			case "completionDuration":
				return (
					<div className="text-sm">
						{edit.completionDuration
							? `${edit.completionDuration} min`
							: POSTS_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
					</div>
				);
			case "coins":
				return (
					<div className="text-sm">
						{POSTS_CONSTANTS.BADGE_LABELS.NOT_APPLICABLE}
					</div>
				);
			case "createdAt":
				return (
					<div className="text-sm text-muted-foreground">
						{new Date(edit.createdAt).toLocaleDateString()}
					</div>
				);
			case "updatedAt":
				return (
					<div className="text-sm text-muted-foreground">
						{new Date(edit.updatedAt).toLocaleDateString()}
					</div>
				);
			case "status":
				return (
					<Badge
						variant={
							edit.status === PostStatus.PUBLISHED ? "default" : "secondary"
						}
					>
						{edit.status}
					</Badge>
				);
			case "approvalStatus":
				return (
					<Badge
						variant={
							edit.approvalStatus === PostApprovalStatus.APPROVED
								? "default"
								: edit.approvalStatus === PostApprovalStatus.PENDING
									? "secondary"
									: "destructive"
						}
						className={
							edit.approvalStatus === PostApprovalStatus.APPROVED
								? "bg-green-600 hover:bg-green-700"
								: edit.approvalStatus === PostApprovalStatus.PENDING
									? "bg-yellow-600 hover:bg-yellow-700"
									: "bg-red-600 hover:bg-red-700"
						}
					>
						{edit.approvalStatus}
					</Badge>
				);
			default:
				return null;
		}
	};

	const renderPostActions = (post: PostWithAuthor) => {
		const isAuthor = post.authorId === session?.user?.id;

		return (
			<div className="flex gap-2">
				<Button size="sm" variant="outline" onClick={() => handleView(post)}>
					<Eye className="h-4 w-4" />
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => handleEdit(post)}>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						{isAuthor && (
							<DropdownMenuItem
								onClick={() => openDeleteDialog(post.id)}
								className="text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		);
	};

	const renderEditActions = (edit: PostEditWithAuthor) => {
		const isAuthor = edit.authorId === session?.user?.id;
		const previewUrl = generatePreviewUrl({
			category: edit.category,
			subCategory: edit.subCategory,
			postType: edit.type,
			postId: edit.postId,
			edited: true,
		});

		const editPath = generateEditPath({
			category: edit.category,
			subCategory: edit.subCategory,
			postType: edit.type,
			postId: edit.postId,
			approvalStatus: edit.approvalStatus,
			isPostEdit: true,
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
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => window.open(editPath, "_blank")}>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						{isAuthor && (
							<DropdownMenuItem
								onClick={() => openDeleteEditDialog(edit.id)}
								className="text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">
					{POSTS_CONSTANTS.TITLES.USER_POSTS}
				</h2>
				<div className="flex gap-2">
					<Badge variant="outline">
						{totalPosts} {POSTS_CONSTANTS.BADGE_LABELS.MY_POSTS}
					</Badge>
					<Badge variant="outline">
						{totalEdits} {POSTS_CONSTANTS.BADGE_LABELS.POST_EDITS}
					</Badge>
				</div>
			</div>

			<Tabs defaultValue={POSTS_CONSTANTS.TABS.MY_POSTS} className="space-y-4">
				<TabsList>
					<TabsTrigger
						value={POSTS_CONSTANTS.TABS.MY_POSTS}
						className="flex items-center gap-2"
					>
						<FileText className="h-4 w-4" />
						{POSTS_CONSTANTS.TITLES.MY_POSTS} ({totalPosts})
					</TabsTrigger>
					<TabsTrigger
						value={POSTS_CONSTANTS.TABS.POST_EDITS}
						className="flex items-center gap-2"
					>
						<Edit className="h-4 w-4" />
						{POSTS_CONSTANTS.TITLES.POST_EDITS} ({totalEdits})
					</TabsTrigger>
				</TabsList>

				<TabsContent value={POSTS_CONSTANTS.TABS.MY_POSTS}>
					<DataTable<PostWithAuthor>
						data={posts}
						loading={postsLoading}
						columns={postsColumnConfig}
						categoryColumns={postsCategoryColumns}
						defaultColumns={postsDefaultColumns}
						searchQuery={postsSearchQuery}
						setSearchQuery={setPostsSearchQuery}
						sortField={postsSortField}
						sortOrder={postsSortOrder}
						setSortField={setPostsSortField}
						setSortOrder={setPostsSortOrder}
						renderCell={renderPostCell}
						renderActions={renderPostActions}
						title={POSTS_CONSTANTS.TITLES.MY_POSTS}
						emptyMessage={POSTS_CONSTANTS.EMPTY_MESSAGES.NO_MY_POSTS}
						loadingMessage={POSTS_CONSTANTS.LOADING_MESSAGES.POSTS}
						searchPlaceholder={POSTS_CONSTANTS.SEARCH_PLACEHOLDERS.POSTS}
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

				<TabsContent value={POSTS_CONSTANTS.TABS.POST_EDITS}>
					<DataTable<PostEditWithAuthor>
						data={postEdits}
						loading={editsLoading}
						columns={postsColumnConfig}
						categoryColumns={postsCategoryColumns}
						defaultColumns={postsDefaultColumns}
						searchQuery={editsSearchQuery}
						setSearchQuery={setEditsSearchQuery}
						sortField={editsSortField}
						sortOrder={editsSortOrder}
						setSortField={setEditsSortField}
						setSortOrder={setEditsSortOrder}
						renderCell={renderEditCell}
						renderActions={renderEditActions}
						title={POSTS_CONSTANTS.TITLES.POST_EDITS}
						emptyMessage={POSTS_CONSTANTS.EMPTY_MESSAGES.NO_POST_EDITS}
						loadingMessage={POSTS_CONSTANTS.LOADING_MESSAGES.EDITS}
						searchPlaceholder={POSTS_CONSTANTS.SEARCH_PLACEHOLDERS.EDITS}
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

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{selectedPostEditId ? "Delete Post Edit" : "Delete Post"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this{" "}
							{selectedPostEditId ? "post edit" : "post"}? This action cannot be
							undone and will permanently remove the{" "}
							{selectedPostEditId ? "edit" : "post"} and all its data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeletingPost || isDeletingEdit}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={
								selectedPostEditId ? handleDeletePostEdit : handleDeletePost
							}
							disabled={isDeletingPost || isDeletingEdit}
							className="bg-red-600 hover:bg-red-700"
						>
							{isDeletingPost || isDeletingEdit ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
