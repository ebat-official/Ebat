import { CommentWithVotes, PaginatedComments } from "@/utils/types";
import { CommentViewBox } from "./CommentViewBox";
import { LiaCommentsSolid } from "react-icons/lia";

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "../ui/card";
import { FaComments } from "react-icons/fa";
import { CommentSkeleton } from "./CommentSkelton";

interface CommentListProps {
	comments: PaginatedComments | undefined;
	postId: string;
	currentPage?: number;
	setCurrentPage?: number;
	isLoading?: boolean;
}

export function CommentList({
	comments,
	postId,
	currentPage,
	setCurrentPage,
	isLoading,
}: CommentListProps) {
	const commentsExists = comments?.comments?.length;
	console.log(isLoading, "loading", typeof isLoading);
	return (
		<div className="flex flex-col gap-10">
			<div className="space-y-4">
				{isLoading ? (
					<div className="flex flex-col gap-5">
						{Array(5)
							.fill(0)
							.map((key) => (
								<CommentSkeleton key={key} />
							))}
					</div>
				) : (
					<>
						{!commentsExists && (
							<Card className="w-[90%] self-center border-0 shadow-none">
								<CardContent className="flex flex-col  items-center gap-2">
									<FaComments size={100} className="opacity-20" />
									<h2 className="capitalize text-lg font-semibold">
										No comments yet
									</h2>
									<text className="">Be the first one to comment !</text>
								</CardContent>
							</Card>
						)}
						{comments?.comments.map((comment) => (
							<CommentViewBox
								key={comment.id}
								comment={comment}
								postId={postId}
							/>
						))}
					</>
				)}
			</div>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious href="#" />
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#">1</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#" isActive>
							2
						</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#">3</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
					<PaginationItem>
						<PaginationNext href="#" />
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
