// app/[category]/[subCategory]/questions/create/[[...postId]]/loading.tsx

"use client";
import Loader from "@/components/shared/Loader/Loader";
import React from "react";

const Loading = () => {
	return (
		<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
			<div className="flex flex-col justify-center items-center space-y-4">
				<Loader />
			</div>
		</div>
	);
};

export default Loading;
