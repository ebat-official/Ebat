import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-transition-progress/next";
import { useParams, usePathname, useRouter } from "next/navigation";
import { SubCategory } from "@/db/schema/enums";
import React, { startTransition } from "react";
import { IoMdAdd } from "react-icons/io";
import { useProgress } from "react-transition-progress";

const AddPostRoundButton: React.FC = () => {
	const pathname = usePathname();
	const params = useParams();
	const router = useRouter();
	const startProgress = useProgress();

	// Get subcategory from params, default to 'blogs' if not present
	const subCategory = params.subCategory || SubCategory.BLOGS;

	// If we have a subcategory in the URL, use the current path + /create
	// If we don't have a subcategory, append the default subcategory + /create
	const createPath = params.subCategory
		? `${pathname}/create`
		: `${pathname}/${subCategory}/create`;

	// Alternative approach using manual navigation with progress
	const handleClick = () => {
		startTransition(async () => {
			startProgress();
			router.push(createPath);
		});
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md hover:scale-105 transition-transform cursor-pointer"
					aria-label="Add Post"
					onClick={handleClick}
				>
					<IoMdAdd className="w-7 h-7 text-white" />
				</button>
			</TooltipTrigger>
			<TooltipContent>Create a post</TooltipContent>
		</Tooltip>
	);
};

export default AddPostRoundButton;
