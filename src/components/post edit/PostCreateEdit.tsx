"use client";

import LoginModal from "@/components/auth/LoginModal";
import QuestionSidebar from "@/components/rightSidebar/QuestionSidebar";
import { EditorProvider } from "@/components/shared/Lexical Editor/providers/EditorContext";
import RightPanelLayout from "@/components/shared/RightPanelLayout";
import StatusDialog from "@/components/shared/StatusDialog";
import { Button } from "@/components/ui/button";
import { PostType, SubCategory } from "@/db/schema/enums";
import { usePostFetchManager } from "@/hooks/query/usePostFetchManager";
import { usePostPublishManager } from "@/hooks/query/usePostPublishManager";
import { toast } from "@/hooks/use-toast";
import { generateNanoId } from "@/lib/generateNanoid";
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
	const [sidebarData, setSidebarData] = useState({});
	const router = useRouter();
	const startProgress = useProgress();
	const [postId, setPostId] = useState<string>(initialPostId || "");
	const currentPath = usePathname();
	const [loginModalMessage, setLoginModalMessage] = useState<string>("");
	const [postPublished, setPostPublished] = useState<boolean | string>(false);
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
		return {
			postId,
			category,
			subCategory,
			postContent: content,
			thumbnail: thumbnail || postData?.thumbnail,
			challengeTemplates,
			sidebarData,
			type: postType,
		};
	};

	const saveHandler = async (postContent: ContentType) => {
		const data = getPostData(postContent);
		const result = await saveDraft(data);
		if (result.data) {
			toast({
				title: "Draft Saved",
				description: "Your draft has been saved successfully",
				variant: "default",
			});
		}
	};

	const publishHandler = async (postContent: ContentType) => {
		const data = getPostData(postContent);
		if (
			(postType === PostType.BLOGS || postType === PostType.SYSTEMDESIGN) &&
			!data.thumbnail
		) {
			//thumbnail is required for blogs and system design
		}
		const result = await publish(data);
		if (result.data) {
			setPostPublished(result.data.slug || true);
		}
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
			<StatusDialog>
				<StatusDialog.Title>Post Published</StatusDialog.Title>
				<StatusDialog.Content>
					{action === POST_ACTIONS.CREATE
						? "Your post has been published and sent for approval"
						: "Your post edit has sent for approval"}
				</StatusDialog.Content>
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

	return (
		<>
			{loginModalMessage && (
				<LoginModal
					closeHandler={() => setLoginModalMessage("")}
					message={loginModalMessage}
				/>
			)}
			<EditorProvider>
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
			</EditorProvider>
		</>
	);
}

export default PostCreateEdit;
