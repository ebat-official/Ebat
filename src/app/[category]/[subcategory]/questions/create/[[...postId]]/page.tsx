"use client";
import RightPanelLayout from "@/components/shared/RightPanelLayout";
import React, { useEffect, useRef, useState } from "react";
import EditorQuestion from "@/components/shared/Editor/EditorQuestion";
import QuestionSidebar from "@/components/rightSidebar/QuestionSidebar";
import { useParams, usePathname, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { generateNanoId } from "@/lib/generateNanoid";
import isValidSubCategory from "@/utils/isValidSubCategory";
import isValidCategory from "@/utils/isValidiCategory";
import {
	PostDraftType,
	PostDraftValidator,
	PostValidator,
} from "@/lib/validators/post";
import { toast } from "@/hooks/use-toast";
import { createDraftPost, createPost } from "@/actions/post";
import LoginModal from "@/components/auth/LoginModal";
import {
	CategoryType,
	ContentType,
	QuestionSidebarData,
	SubCategoryType,
} from "@/utils/types";
import { handleError } from "@/utils/handleError";
import { POST_NOT_EXIST_ERROR, UNAUTHENTICATED_ERROR } from "@/utils/errors";
import { useServerAction } from "@/hooks/useServerAction";
import { Post, PostType } from "@prisma/client";
import { usePostDraft } from "@/hooks/query/usePostDraft";
import StatusDialog from "@/components/shared/StatusDialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function Page() {
	const {
		category: categoryRoute,
		subCategory: subCategoryRoute,
		postId: postIdParam,
	} = useParams();
	const [sidebarData, setSidebarData] = useState({});
	const subCategory = (
		Array.isArray(subCategoryRoute) ? subCategoryRoute[0] : subCategoryRoute
	)?.toUpperCase();
	const category = (
		Array.isArray(categoryRoute) ? categoryRoute[0] : categoryRoute
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
	const [actionCreateDraft, isCreateDraftActionLoading] =
		useServerAction(createDraftPost);
	const [actionCreatePost, isCreatePostActionLoading] =
		useServerAction(createPost);

	if (
		!category ||
		!subCategory ||
		!isValidSubCategory(subCategory) ||
		!isValidCategory(category)
	) {
		notFound();
	}

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

	const consolidateData = (
		postId: string,
		category: CategoryType,
		subCategory: SubCategoryType,
		postContent: ContentType,
		sidebarData: Record<string, unknown>,
	): PostDraftType => {
		return {
			id: postId,
			type: PostType.QUESTION,
			category,
			subCategory,
			title: postContent?.post?.title,
			content: postContent,
			...sidebarData,
		};
	};

	const formatSidebarDefaultData = (
		post: Post | undefined,
	): QuestionSidebarData | undefined => {
		if (!post) return;
		return {
			companies: post.companies || [],
			topics: post.topics || [],
			difficulty: post.difficulty || "",
			completionDuration: post.completionDuration || 0,
		};
	};

	const saveHandler = async (postContent: ContentType) => {
		try {
			const data = consolidateData(
				postId,
				category,
				subCategory,
				postContent,
				sidebarData,
			);
			const result = PostDraftValidator.safeParse(data);
			if (!result.success) {
				postMutationErrorHandler(result.error);
				return;
			}
			const savedPostId = await actionCreateDraft(result.data);
			toast({
				title: "Draft Saved",
				description: "Your draft has been saved successfully",
				variant: "default",
			});
			return savedPostId;
		} catch (error) {
			postMutationErrorHandler(error);
		}
	};

	const publishHandler = async (postContent: ContentType) => {
		try {
			const data = consolidateData(
				postId,
				category,
				subCategory,
				postContent,
				sidebarData,
			);
			const result = PostValidator.safeParse(data);
			if (!result.success) {
				throw result.error;
			}

			const publishedPostId = await actionCreatePost(result.data);
			setPostPublished(true);

			return publishedPostId;
		} catch (error) {
			postMutationErrorHandler(error);
		}
	};

	function postMutationErrorHandler(error: unknown) {
		const message = handleError(error, PostType.QUESTION);

		if (message && message === UNAUTHENTICATED_ERROR.data.message) {
			setLoginModalMessage("Please sign in to publish your post");
			return;
		}
		toast({
			description: message,
			variant: "destructive",
		});
	}

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
			<RightPanelLayout className="mt-8 min-h-[75vh]">
				<RightPanelLayout.MainPanel>
					<EditorQuestion
						postId={postId}
						saveHandler={saveHandler}
						publishHandler={publishHandler}
						dataLoading={isLoading}
						actionDraftLoading={isCreateDraftActionLoading}
						actionPublishLoading={isCreatePostActionLoading}
						defaultContent={postData?.content}
					/>
				</RightPanelLayout.MainPanel>
				<RightPanelLayout.SidePanel>
					<QuestionSidebar
						postId={postId}
						subCategory={subCategory}
						getSidebarData={setSidebarData}
						defaultContent={formatSidebarDefaultData(postData)}
						dataLoading={isLoading}
					/>
				</RightPanelLayout.SidePanel>
			</RightPanelLayout>
		</>
	);
}

export default Page;
