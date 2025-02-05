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
import { PostDraftType, PostDraftValidatorUI } from "@/lib/validators/post";
import { toast } from "@/hooks/use-toast";
import { QUESTION_TYPE } from "@/utils/contants";
import { CreateDraftPost } from "@/actions/post";
import { UNAUTHENTICATED_ERROR, UNAUTHORIZED_ERROR } from "@/utils/errors";
import { InitialBlocks as ContentBlocks } from "@/components/shared/Editor/EditorQA";

function page() {
	const {
		category: categoryRoute,
		subCategory: subCategoryRoute,
		postId: postIdParam,
	} = useParams();
	const [sidebarData, setSidebatData] = useState({});
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
			console.log("fetch dataa");

			isLoading(false);
		} else {
			const newPostId = generateNanoId();
			setPostId(newPostId);

			const newRoute = `${currentPath}/${newPostId}`;
			window.history.pushState({}, "", newRoute);
		}
	}, [editPostId]);

	const consolidateData = (postContent: ContentBlocks): PostDraftType => {
		return {
			id: postId,
			type: QUESTION_TYPE,
			category,
			subCategory,
			title: postContent?.post?.title,
			content: postContent,
			...sidebarData,
		};
	};

	const saveHandler = async (postContent: ContentBlocks) => {
		try {
			const data = consolidateData(postContent);

			// Validate client-side data first
			const result = PostDraftValidatorUI.safeParse(data);
			if (!result.success) {
				const firstError = result.error.errors[0];
				const errorMessage = `${firstError.path.join(".")}: ${firstError.message}`;
				toast({
					title: "Validation Error",
					description: errorMessage,
					variant: "destructive",
				});
				return;
			}

			const postId = await CreateDraftPost(result.data);

			toast({
				title: "Draft Saved",
				description: "Your draft has been saved successfully",
				variant: "default",
			});

			// Optional: Handle post-save navigation or state updates
			return postId;
		} catch (error) {
			// Handle known error types
			let title = "Error";
			let description = "An unexpected error occurred";

			if (error instanceof Error) {
				// Check for authentication errors
				if (error.message === UNAUTHENTICATED_ERROR.data.message) {
					title = "Authentication Required";
					description = "Please sign in to save your draft";
				}
				// Check for authorization errors (if implemented)
				else if (error.message === UNAUTHORIZED_ERROR.data.message) {
					title = "Permission Denied";
					description = "You don't have permission to perform this action";
				}
				// Check for server-side validation error (shouldn't normally hit this)
				else if (error.message.includes("Draft post data is not valid")) {
					title = "Invalid Data";
					description = "Please check your input and try again";
				}
				// Check for database errors
				else if (error.message.includes("Something went wrong while saving")) {
					title = "Save Failed";
					description = "Could not save draft. Please try again";
				}
				// Fallback to original error message
				else {
					description = error.message;
				}
			}

			toast({
				title,
				description,
				variant: "destructive",
			});

			// For debugging purposes
			console.error("Save Draft Error:", error);
		}
	};
	const publishHanlder = (postContent: ContentBlocks) => {};

	return (
		<RightPanelLayout className="mt-8 min-h-[75vh]">
			<RightPanelLayout.MainPanel>
				<EditorQuestion
					postId={postId}
					saveHandler={saveHandler}
					publishHanlder={publishHanlder}
					dataLoading={loading}
				/>
			</RightPanelLayout.MainPanel>
			<RightPanelLayout.SidePanel>
				<QuestionSidebar
					postId={postId}
					subCategory={subCategory}
					getSidebarData={setSidebatData}
				/>
			</RightPanelLayout.SidePanel>
		</RightPanelLayout>
	);
}

export default page;
