"use client";

import PostCreateEdit from "@/components/post edit/PostCreateEdit";
import { PostType, SubCategory } from "@/db/schema/enums";
import { POST_ACTIONS } from "@/utils/constants";
import isValidCategory from "@/utils/isValidCategory";
import { notFound, useParams } from "next/navigation";
import React from "react";

function Page() {
	const {
		category: categoryRoute,
		subCategory: subCategoryRoute,
		postId: postIdParam,
	} = useParams();

	const category = (
		Array.isArray(categoryRoute) ? categoryRoute[0] : categoryRoute
	)?.toLowerCase();
	const subCategory = (
		Array.isArray(subCategoryRoute) ? subCategoryRoute[0] : subCategoryRoute
	)?.toLowerCase();

	const postId = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam;

	// Validate dynamic parameters
	if (
		!category ||
		!subCategory ||
		!(
			subCategory === SubCategory.BLOGS ||
			subCategory === SubCategory.SYSTEMDESIGN
		) ||
		!isValidCategory(category)
	) {
		notFound();
	}

	return (
		<PostCreateEdit
			category={category}
			subCategory={subCategory}
			postId={postId}
			action={POST_ACTIONS.EDIT}
			postType={
				subCategory === SubCategory.BLOGS ? PostType.BLOGS : PostType.HLD
			}
		/>
	);
}

export default Page;
