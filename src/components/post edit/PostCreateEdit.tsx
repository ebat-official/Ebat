"use client";

import LoginModal from "@/components/auth/LoginModal";
import QuestionSidebar from "@/components/rightSidebar/QuestionSidebar";
import { useEditorStore } from "@/store/useEditorStore";
import RightPanelLayout from "@/components/shared/RightPanelLayout";
import PostPublishedModal from "@/components/shared/PostPublishedModal";
import StatusDialog from "@/components/shared/StatusDialog";
import { Button } from "@/components/ui/button";
import {
	PostApprovalStatus,
	PostCategory,
	PostStatusType,
	PostType,
	SubCategory,
} from "@/db/schema/enums";
import { usePostFetchManager } from "@/hooks/query/usePostFetchManager";
import { usePostPublishManager } from "@/hooks/query/usePostPublishManager";
import { toast } from "@/hooks/use-toast";
import { generateNanoId } from "@/lib/generateNanoid";
import { PostDraftValidator, PostValidator } from "@/lib/validators/post";
import consolidatePostData from "@/utils/consolidatePostData";
import { POST_ACTIONS } from "@/utils/constants";
import { POST_NOT_EXIST_ERROR, UNAUTHENTICATED_ERROR } from "@/utils/errors";
import formatSidebarDefaultData from "@/utils/formatSidebarDefaultData";
import { handleError } from "@/utils/handleError";
import {
	CategoryType,
	ChallengeTemplate,
	ContentType,
	PostActions,
	PostWithContent,
	SubCategoryType,
	QuestionSidebarData,
} from "@/utils/types";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, startTransition } from "react";
import { useProgress } from "react-transition-progress";
import EditorContainer from "./EditorContainer";

interface PostCreateEditProps {
	category: CategoryType;
	subCategory: SubCategoryType;
	postId?: string;
	action: PostActions;
	postType: PostType;
}

function PostCreateEdit({
	category,
	subCategory,
	postId: initialPostId,
	action,
	postType,
}: PostCreateEditProps) {
	const [sidebarData, setSidebarData] = useState<QuestionSidebarData>({});
	const router = useRouter();
	const startProgress = useProgress();
	const [postId, setPostId] = useState<string>(initialPostId || "");
	const currentPath = usePathname();
	const [loginModalMessage, setLoginModalMessage] = useState<string>("");
	const [postPublished, setPostPublished] = useState<{
		id: string;
		slug: string;
		approvalStatus: PostApprovalStatus;
		title: string;
		category: PostCategory;
		subCategory: SubCategory;
		postType: PostType;
	} | null>(null);
	const [blockUserAccess, setBlockUserAccess] = useState<{
		message?: string;
		title?: string;
	} | null>();

	const isEditMode = useRef<boolean>(!!postId);
	const isApprovedPostEdit = action === POST_ACTIONS.EDIT;

	const {
		saveDraft,
		publish,
		isDrafting,
		isPublishing,
		error: postPublishError,
	} = usePostPublishManager(subCategory, action);

	const {
		data: postData,
		isLoading,
		error: postFetchError,
	} = usePostFetchManager({
		postId,
		action,
		enabled: isEditMode.current || isApprovedPostEdit,
	});

	useEffect(() => {
		if (!postId) {
			const newPostId = generateNanoId();
			setPostId(newPostId);
			const newRoute = `${currentPath}/${newPostId}`;
			window.history.pushState({}, "", newRoute);
		}
	}, [postId, currentPath]);

	useEffect(() => {
		if (!postFetchError) return;
		const message = handleError(postFetchError, postType);

		if (message && message === UNAUTHENTICATED_ERROR.data.message) {
			setLoginModalMessage("Please sign in to edit your post");
			return;
		}
		if (message && message === POST_NOT_EXIST_ERROR.data.message) {
			// User might have reloaded without saving
			return;
		}
		setBlockUserAccess({
			message,
			title: (postFetchError.cause as string) || "",
		});
	}, [postFetchError]);

	useEffect(() => {
		if (!postPublishError) return;

		const message = handleError(postPublishError, postType);
		if (message && message === UNAUTHENTICATED_ERROR.data.message) {
			setLoginModalMessage("Please sign in to publish your post");
			return;
		}
		toast({
			description: message,
			variant: "destructive",
		});
	}, [postPublishError]);

	const getPostData = (postContent: ContentType) => {
		const { thumbnail, challengeTemplates, ...content } = postContent;

		// Update postType based on sidebar data for system design types
		let finalPostType = postType;
		if (
			sidebarData.systemDesignType &&
			(postType === PostType.HLD || postType === PostType.LLD)
		) {
			finalPostType = sidebarData.systemDesignType;
		}

		return {
			postId,
			category,
			subCategory,
			postContent: content,
			thumbnail: thumbnail || postData?.thumbnail,
			challengeTemplates,
			sidebarData,
			type: finalPostType,
		};
	};

	/**
	 * Validates draft post data
	 */
	const validateDraftData = (params: {
		postId: string;
		category: CategoryType;
		sidebarData: Record<string, unknown>;
		postContent: ContentType;
		type: PostType;
		thumbnail?: string | null;
	}) => {
		const consolidated = consolidatePostData(params);
		const result = PostDraftValidator.safeParse(consolidated);
		if (!result.success) {
			return { error: result.error };
		}
		return { data: result.data };
	};

	/**
	 * Validates post data before publishing
	 */
	const validateData = (params: {
		postId: string;
		category: CategoryType;
		sidebarData: Record<string, unknown>;
		postContent: ContentType;
		type: PostType;
		thumbnail?: string | null;
	}) => {
		const consolidated = consolidatePostData(params);
		const result = PostValidator.safeParse(consolidated);

		if (!result.success) {
			return { error: result.error };
		}
		return { data: result.data };
	};

	const saveHandler = async (postContent: ContentType) => {
		const data = getPostData(postContent);
		const validated = validateDraftData(data);
		if (validated.error) {
			const message = handleError(validated.error, postType);
			toast({
				description: message,
				variant: "destructive",
			});
			return { error: validated.error, isLoading: false };
		}

		const result = await saveDraft(validated.data);
		if (result.data) {
			toast({
				title: "Draft Saved",
				description: "Your draft has been saved successfully",
				variant: "default",
			});
		}
		return result;
	};

	const publishHandler = async (
		postContent: ContentType,
		postStatus?: PostStatusType,
	) => {
		const data = getPostData(postContent);
		const validated = validateData(data);
		if (validated.error) {
			const message = handleError(validated.error, postType);
			toast({
				description: message,
				variant: "destructive",
			});
			return { error: validated.error, isLoading: false };
		}

		if (
			(postType === PostType.BLOGS ||
				postType === PostType.HLD ||
				postType === PostType.LLD) &&
			!data.thumbnail
		) {
			//thumbnail is required for blogs and system design
		}
		const result = await publish(validated.data, postStatus);
		if (result.data) {
			// Get title from postContent
			const title =
				postContent.post?.title || postContent.answer?.title || "Untitled";
			setPostPublished({
				id: result.data.id,
				slug: result.data.slug || "",
				approvalStatus: result.data.approvalStatus,
				title,
				category: category as PostCategory,
				subCategory: subCategory as SubCategory,
				postType,
			});
		}
		return result;
	};

	if (blockUserAccess) {
		return (
			<StatusDialog type="error">
				<StatusDialog.Title>{blockUserAccess?.title}</StatusDialog.Title>
				<StatusDialog.Content>{blockUserAccess?.message}</StatusDialog.Content>
				<StatusDialog.Footer>
					<Button
						className="w-[90%] blue-gradient text-white"
						onClick={() => {
							startTransition(async () => {
								startProgress();
								router.push("/");
							});
						}}
					>
						Go back to home
					</Button>
				</StatusDialog.Footer>
			</StatusDialog>
		);
	}
	if (postPublished) {
		return (
			<PostPublishedModal
				postData={postPublished}
				action={action}
				category={category}
			/>
		);
	}

	return (
		<>
			{loginModalMessage && (
				<LoginModal
					closeHandler={() => setLoginModalMessage("")}
					message={loginModalMessage}
				/>
			)}
			<RightPanelLayout className="mt-8 min-h-[75vh]">
				<RightPanelLayout.MainPanel>
					<EditorContainer
						postId={postId}
						postType={postType}
						saveHandler={saveHandler}
						publishHandler={publishHandler}
						dataLoading={isLoading}
						actionDraftLoading={isDrafting}
						actionPublishLoading={isPublishing}
						defaultContent={postData?.content}
						action={action}
						challengeTemplates={postData?.challengeTemplates}
						category={category}
						subCategory={subCategory}
					/>
				</RightPanelLayout.MainPanel>
				<RightPanelLayout.SidePanel className="sticky">
					<QuestionSidebar
						postType={postType}
						postId={postId}
						topicCategory={subCategory || SubCategory.JAVASCRIPT}
						getSidebarData={setSidebarData}
						defaultContent={formatSidebarDefaultData(postData)}
						dataLoading={isLoading}
					/>
				</RightPanelLayout.SidePanel>
			</RightPanelLayout>
		</>
	);
}

export default PostCreateEdit;
