"use client";

import React, { useEffect, useRef, useState } from "react";
import RightPanelLayout from "@/components/shared/RightPanelLayout";
import EditorContainer from "@/components/shared/Editor/EditorContainer";
import QuestionSidebar from "@/components/rightSidebar/QuestionSidebar";
import { usePathname, useRouter } from "next/navigation";
import { generateNanoId } from "@/lib/generateNanoid";
import { toast } from "@/hooks/use-toast";
import LoginModal from "@/components/auth/LoginModal";
import {
	CategoryType,
	ContentType,
	PostActions,
	SubCategoryType,
} from "@/utils/types";
import { handleError } from "@/utils/handleError";
import { POST_NOT_EXIST_ERROR, UNAUTHENTICATED_ERROR } from "@/utils/errors";
import { PostType } from "@prisma/client";
import StatusDialog from "@/components/shared/StatusDialog";
import { Button } from "@/components/ui/button";
import { usePostPublishManager } from "@/hooks/query/usePostPublishManager";
import formatSidebarDefaultData from "@/utils/formatSidebarDefaultData";
import { EditorProvider } from "@/components/shared/Lexical Editor/providers/EditorContext";
import { POST_ACTIONS } from "@/utils/contants";
import { usePostFetchManager } from "@/hooks/query/usePostFetchManager";

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
	const [postId, setPostId] = useState<string>(initialPostId || "");
	const currentPath = usePathname();
	const [loginModalMessage, setLoginModalMessage] = useState<string>("");
	const [postPublished, setPostPublished] = useState<boolean>(false);
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
	} = usePostPublishManager();

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
		return {
			postId,
			category,
			subCategory:
				postType === PostType.BLOGS || postType === PostType.SYSTEMDESIGN
					? undefined
					: subCategory,
			postContent,
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
		const result = await publish(data);
		if (result.data) {
			setPostPublished(true);
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
						onClick={() => router.push("/")}
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
					Your post has been published and sent for approval
				</StatusDialog.Content>
				<StatusDialog.Footer>
					<Button
						className="w-[90%] blue-gradient text-white"
						onClick={() => router.push("/")}
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
						/>
					</RightPanelLayout.MainPanel>
					<RightPanelLayout.SidePanel>
						<QuestionSidebar
							postId={postId}
							topicCategory={subCategory || "JAVASCRIPT"}
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
