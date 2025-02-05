"use client";
import RightPanelLayout from "@/components/shared/RightPanelLayout";
import React, { useEffect, useState } from "react";
import EditorQuestion from "@/components/shared/Editor/EditorQuestion";
import QuestionSidebar from "@/components/rightSidebar/QuestionSidebar";
import { useParams, usePathname } from "next/navigation";
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
import { CategoryType, ContentType, SubCategoryType } from "@/utils/types";
import { handleError } from "@/utils/errorHandler";

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
	const editPostId = (
		Array.isArray(postIdParam) ? postIdParam[0] : postIdParam
	)?.toUpperCase();
	const [loading, isLoading] = useState(!!postIdParam);
	const [postId, setPostId] = useState<string>("");
	const currentPath = usePathname();
	const [loginModalMessage, setLoginModalMessage] = useState<string>("");

	if (
		!category ||
		!subCategory ||
		!isValidSubCategory(subCategory) ||
		!isValidCategory(category)
	) {
		notFound();
	}

	useEffect(() => {
		if (editPostId) {
			setPostId(editPostId);
			console.log("fetch data");
			isLoading(false);
		} else {
			const newPostId = generateNanoId();
			setPostId(newPostId);
			const newRoute = `${currentPath}/${newPostId}`;
			window.history.pushState({}, "", newRoute);
		}
	}, [editPostId]);

	const consolidateData = (
		postId: string,
		category: CategoryType,
		subCategory: SubCategoryType,
		postContent: ContentType,
		sidebarData: Record<string, unknown>,
	): PostDraftType => {
		return {
			id: postId,
			type: "QUESTION",
			category,
			subCategory,
			title: postContent?.post?.title,
			content: postContent,
			...sidebarData,
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
				const firstError = result.error.errors[0];
				const errorMessage = `${firstError.path.join(".")}: ${firstError.message}`;
				throw new Error(`Validation Error: ${errorMessage}`);
			}

			const savedPostId = await createDraftPost(result.data);
			toast({
				title: "Draft Saved",
				description: "Your draft has been saved successfully",
				variant: "default",
			});
			return savedPostId;
		} catch (error) {
			const { shouldShowLogin, message } = handleError(error);
			if (shouldShowLogin) {
				setLoginModalMessage(message || "Please sign in to save your draft");
			}
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
				const firstError = result.error.errors[0];
				const errorMessage = `${firstError.path.join(".")}: ${firstError.message}`;
				throw new Error(`Validation Error: ${errorMessage}`);
			}

			const publishedPostId = await createPost(result.data);
			toast({
				title: "Post Published",
				description: "Your post has been published successfully",
				variant: "default",
			});
			return publishedPostId;
		} catch (error) {
			const { shouldShowLogin, message } = handleError(error);
			if (shouldShowLogin) {
				setLoginModalMessage(message || "Please sign in to publish your post");
			}
		}
	};

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
						dataLoading={loading}
					/>
				</RightPanelLayout.MainPanel>
				<RightPanelLayout.SidePanel>
					<QuestionSidebar
						postId={postId}
						subCategory={subCategory}
						getSidebarData={setSidebarData}
					/>
				</RightPanelLayout.SidePanel>
			</RightPanelLayout>
		</>
	);
}

export default Page;
