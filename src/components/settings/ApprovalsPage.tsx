"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDraftApproval } from "@/hooks/query/useApprovalPosts";
import { useEditApproval } from "@/hooks/query/useEditApproval";
import { FileText, Edit, Eye, MoreHorizontal } from "lucide-react";
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
import type { PostWithAuthor, PostEditWithAuthor } from "./types";
import { renderPostCell, renderEditCell } from "./approvalUtils";
import { generatePreviewUrl } from "@/utils/generatePreviewUrl";

export function ApprovalsPage() {
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

	// Separate queries for each tab
	const {
		data: postsData,
		isLoading: postsLoading,
		error: postsError,
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

	const renderPostActions = (post: PostWithAuthor) => {
		const previewUrl = generatePreviewUrl({
			category: post.category,
			subCategory: post.subCategory,
			postType: post.type,
			postId: post.id,
			userId: post.author?.id,
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
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
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
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
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
		</div>
	);
}
