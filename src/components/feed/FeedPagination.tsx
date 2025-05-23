import React from "react";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { useFeedContext } from "./FeedContext";

const MAX_VISIBLE = 5;

function getPages(page: number, totalPages: number) {
	if (totalPages <= MAX_VISIBLE + 2) {
		// Show all pages if not enough for ellipsis
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const pages = [];

	// Always show first page
	pages.push(1);

	// Show ellipsis if needed before window
	if (page > MAX_VISIBLE) {
		pages.push(<PaginationEllipsis key="start-ellipsis" />);
	}

	// Calculate window
	const start = Math.max(2, page - 1);
	const end = Math.min(totalPages - 1, page + 1);

	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	// Show ellipsis if needed after window
	if (page < totalPages - MAX_VISIBLE) {
		pages.push(<PaginationEllipsis key="end-ellipsis" />);
	}

	// Always show last page
	pages.push(totalPages);

	return pages;
}

export const FeedPagination: React.FC = () => {
	const { context, setPage } = useFeedContext();
	const { page = 1, totalPages = 1 } = context || {};

	if (totalPages <= 1) return null;

	const pages = getPages(page, totalPages);

	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						href="#"
						onClick={(e) => {
							e.preventDefault();
							if (page > 1) setPage(page - 1);
						}}
						aria-disabled={page === 1}
					/>
				</PaginationItem>
				{pages.map((p, idx) =>
					typeof p === "number" ? (
						<PaginationItem key={p}>
							<PaginationLink
								href="#"
								isActive={p === page}
								onClick={(e) => {
									e.preventDefault();
									setPage(p);
								}}
							>
								{p}
							</PaginationLink>
						</PaginationItem>
					) : (
						<PaginationItem key={`ellipsis-${idx}`}>{p}</PaginationItem>
					),
				)}
				<PaginationItem>
					<PaginationNext
						href="#"
						onClick={(e) => {
							e.preventDefault();
							if (page < totalPages) setPage(page + 1);
						}}
						aria-disabled={page === totalPages}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};
