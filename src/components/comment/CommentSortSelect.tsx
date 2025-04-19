"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { COMMENT_SORT_OPTIONS } from "@/utils/contants";
import { CommentSortOption } from "@/utils/types";

interface CommentSortSelectProps {
	value?: CommentSortOption;
	defaultValue?: CommentSortOption;
	onChange: (value: CommentSortOption) => void;
}

export function CommentSortSelect({
	value,
	defaultValue = COMMENT_SORT_OPTIONS.TOP,
	onChange,
}: CommentSortSelectProps) {
	return (
		<Select value={value} defaultValue={defaultValue} onValueChange={onChange}>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Sort comments..." />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={COMMENT_SORT_OPTIONS.TOP}>Top Comments</SelectItem>
				<SelectItem value={COMMENT_SORT_OPTIONS.NEWEST}>
					Newest First
				</SelectItem>
				<SelectItem value={COMMENT_SORT_OPTIONS.OLDEST}>
					Oldest First
				</SelectItem>
			</SelectContent>
		</Select>
	);
}
