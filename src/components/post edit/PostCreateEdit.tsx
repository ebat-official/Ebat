"use client";

import LoginModal from "@/components/auth/LoginModal";
import QuestionSidebar from "@/components/rightSidebar/QuestionSidebar";
import RightPanelLayout from "@/components/shared/RightPanelLayout";
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
import { POST_ACTIONS } from "@/utils/constants";
import formatSidebarDefaultData from "@/utils/formatSidebarDefaultData";
import {
	CategoryType,
	ContentType,
	PostActions,
	SubCategoryType,
	QuestionSidebarData,
} from "@/utils/types";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import EditorContainer from "./EditorContainer";
import {
	validateDraftData,
	validateData,
	getPostData,
} from "./utils/postValidation";
import {
	handlePostFetchError,
	handlePostPublishError,
} from "./utils/postErrorHandling";
import PostErrorDialog from "./components/PostErrorDialog";
import PostPublishedModal from "@/components/shared/PostPublishedModal";
import { handleError } from "@/utils/handleError";

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
		handlePostFetchError(postFetchError, postType, {
			setLoginModalMessage,
			setBlockUserAccess,
		});
	}, [postFetchError, postType]);

	useEffect(() => {
		if (!postPublishError) return;
		handlePostPublishError(postPublishError, postType, {
			setLoginModalMessage,
		});
	}, [postPublishError, postType]);

	const getPostDataForValidation = (postContent: ContentType) => {
		return getPostData(postContent, {
			postId,
			category,
			subCategory,
			postType,
			sidebarData,
			postData: postData ? { thumbnail: postData.thumbnail } : undefined,
		});
	};

	const saveHandler = async (postContent: ContentType) => {
		const data = getPostDataForValidation(postContent);
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
		const data = getPostDataForValidation(postContent);
		const validated = validateData(data);
		if (validated.error) {
			const message = handleError(validated.error, postType);
			toast({
				description: message,
				variant: "destructive",
			});
			return { error: validated.error, isLoading: false };
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
		return <PostErrorDialog blockUserAccess={blockUserAccess} />;
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
