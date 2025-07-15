import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react";
import { IoMdAdd } from "react-icons/io";

const AddPostRoundButton: React.FC = () => {
	const pathname = usePathname();
	const params = useParams();

	// Get subcategory from params, default to 'blogs' if not present
	const subCategory = params.subCategory || "blogs";

	// If we have a subcategory in the URL, use the current path + /create
	// If we don't have a subcategory, append the default subcategory + /create
	const createPath = params.subCategory
		? `${pathname}/create`
		: `${pathname}/${subCategory}/create`;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link href={createPath}>
					<button
						type="button"
						className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md hover:scale-105 transition-transform cursor-pointer"
						aria-label="Add Post"
					>
						<IoMdAdd className="w-7 h-7 text-white" />
					</button>
				</Link>
			</TooltipTrigger>
			<TooltipContent>Create a post</TooltipContent>
		</Tooltip>
	);
};

export default AddPostRoundButton;
