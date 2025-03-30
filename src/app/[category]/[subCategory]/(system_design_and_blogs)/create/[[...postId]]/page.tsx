"use client";
import RightPanelLayout from "@/components/shared/RightPanelLayout";
import React, { useEffect, useRef, useState } from "react";
import EditorContainer from "@/components/shared/Editor/EditorContainer";
import QuestionSidebar from "@/components/rightSidebar/QuestionSidebar";
import { useParams, usePathname, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { generateNanoId } from "@/lib/generateNanoid";
import isValidSubCategory from "@/utils/isValidSubCategory";
import isValidCategory from "@/utils/isValidCategory";
import { toast } from "@/hooks/use-toast";
import LoginModal from "@/components/auth/LoginModal";
import { ContentType } from "@/utils/types";
import { handleError } from "@/utils/handleError";
import { POST_NOT_EXIST_ERROR, UNAUTHENTICATED_ERROR } from "@/utils/errors";
import { PostType } from "@prisma/client";
import { usePostDraft } from "@/hooks/query/usePostDraft";
import StatusDialog from "@/components/shared/StatusDialog";
import { Button } from "@/components/ui/button";
import { usePostManager } from "@/hooks/query/usePostManager";
import formatSidebarDefaultData from "@/utils/formatSidebarDefaultData";
import { EditorProvider } from "@/components/shared/Lexical Editor/providers/EditorContext";

function Page() {
	const {
		category: categoryRoute,
		subCategory: subCategoryRoute,
		postId: postIdParam,
	} = useParams();
	const [sidebarData, setSidebarData] = useState({});
	const category = (
		Array.isArray(categoryRoute) ? categoryRoute[0] : categoryRoute
	)?.toUpperCase();
	const postType = (
		Array.isArray(subCategoryRoute) ? subCategoryRoute[0] : subCategoryRoute
	)?.toUpperCase();

	const editPostId = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam;
	const router = useRouter();

	const [postId, setPostId] = useState<string>("");
	const currentPath = usePathname();
	const [loginModalMessage, setLoginModalMessage] = useState<string>("");
	const [postPublished, setPostPublished] = useState<boolean>(false);
	const [blockUserAccess, setBlockUserAccess] = useState<{
		message?: string;
		title?: string;
	} | null>();
	const isEditMode = useRef<boolean>(!!editPostId);
	console.log("page loaded");
	if (
		!category ||
		!postType ||
		!(postType === PostType.BLOGS || postType === PostType.SYSTEMDESIGN) ||
		!isValidCategory(category)
	) {
		notFound();
	}

	const {
		saveDraft,
		publish,
		isDrafting,
		isPublishing,
		error: postPublishError,
	} = usePostManager();

	const {
		data: postData,
		isLoading,
		error: postFetchError,
	} = usePostDraft(editPostId!, {
		enabled: isEditMode.current,
		retry: false,
	});

	useEffect(() => {
		if (editPostId) {
			setPostId(editPostId);
		} else {
			const newPostId = generateNanoId();
			setPostId(newPostId);
			const newRoute = `${currentPath}/${newPostId}`;
			window.history.pushState({}, "", newRoute);
		}
	}, []);

	useEffect(() => {
		if (!postFetchError) return;
		const message = handleError(postFetchError, PostType.QUESTION);

		if (message && message === UNAUTHENTICATED_ERROR.data.message) {
			setLoginModalMessage("Please sign in to edit your post");
			return;
		}
		if (message && message === POST_NOT_EXIST_ERROR.data.message) {
			//user might reloaded without saving
			return;
		}
		setBlockUserAccess({
			message,
			title: (postFetchError.cause as string) || "",
		});
	}, [postFetchError]);

	useEffect(() => {
		if (!postPublishError) return;

		const message = handleError(postPublishError, PostType.QUESTION);

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
							topicCategory={category}
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

export default Page;
