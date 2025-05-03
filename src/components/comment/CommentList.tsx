import { CommentWithVotes, PaginatedComments } from "@/utils/types";
import { CommentViewBox } from "./CommentViewBox";
import { LiaCommentsSolid } from "react-icons/lia";

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "../ui/card";
import { FaComments } from "react-icons/fa";
import { CommentSkeleton } from "./CommentSkelton";
import { useCommentContext } from "./CommentContext";

export function CommentList() {
	const {
		comments,
		isLoading,
		currentPage,
		setCurrentPage,
		totalPages,
		postId,
	} = useCommentContext();
	const commentsExists = comments?.length;

	return (
		<div className="flex flex-col gap-10">
			<div className="space-y-4">
				{isLoading ? (
					<div className="flex flex-col gap-5">
						{Array(5)
							.fill(0)
							.map((_, key) => (
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
						{comments.map((comment) => (
							<CommentViewBox
								key={comment.id}
								comment={comment}
								postId={postId}
							/>
						))}
					</>
				)}
			</div>
			{!!commentsExists && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								aria-disabled={currentPage <= 1}
								onClick={() => setCurrentPage(currentPage - 1)}
								tabIndex={currentPage <= 1 ? -1 : undefined}
								className={
									currentPage <= 1
										? "pointer-events-none opacity-50"
										: undefined
								}
							/>
						</PaginationItem>
						{totalPages &&
							Array.from({ length: totalPages }, (_, index) => (
								<PaginationItem key={index}>
									<PaginationLink
										isActive={currentPage === index + 1}
										onClick={() => setCurrentPage(index + 1)}
									>
										{index + 1}
									</PaginationLink>
								</PaginationItem>
							))}
						<PaginationItem>
							<PaginationNext
								onClick={() => setCurrentPage(currentPage + 1)}
								aria-disabled={currentPage >= totalPages - 1}
								tabIndex={currentPage >= totalPages - 1 ? -1 : undefined}
								className={
									currentPage >= totalPages
										? "pointer-events-none opacity-50"
										: undefined
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}
