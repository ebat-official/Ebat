"use client";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import dynamic from "next/dynamic";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
const Editor = dynamic(() => import("./CommentEditor"), {
	ssr: false,
	loading: () => <Skeleton className="w-full mt-8 h-9" />,
});

export default function Comment({ content }) {
	const [isEditing, setIsEditing] = useState(true);

	return (
		<div>
			{isEditing ? (
				<Card className=" pb-0 ">
					<CardContent className="pl-2 px-0">
						<Editor />
					</CardContent>
				</Card>
			) : (
				<p>{content}</p>
			)}
		</div>
	);
}
