"use client";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./CommentEditor"), {
	ssr: false,
	loading: () => <Skeleton className="w-full mt-8 h-9" />,
});

export default function Comment({ content }) {
	const [isEditing, setIsEditing] = useState(true);

	return (
		<div>
			{isEditing ? <Editor initialContent={content} /> : <p>{content}</p>}
		</div>
	);
}
