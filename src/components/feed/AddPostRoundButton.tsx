import React from "react";
import { IoAddCircleSharp } from "react-icons/io5";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoMdAdd } from "react-icons/io";

const AddPostRoundButton: React.FC = () => {
	const pathname = usePathname();

	return (
		<Link href={`${pathname}/create`}>
			<button
				type="button"
				className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md hover:scale-105 transition-transform cursor-pointer"
				aria-label="Add Post"
			>
				<IoMdAdd className=" w-7 h-7 text-white" />
			</button>
		</Link>
	);
};

export default AddPostRoundButton;
