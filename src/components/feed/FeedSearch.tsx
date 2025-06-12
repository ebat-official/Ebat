import * as React from "react";
import { MagnifyingGlassIcon as SearchIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { useFeedContext } from "./FeedContext";
import SortDropdown from "./SortDropDown";
import { debounce } from "lodash-es";
import { cn } from "@/lib/utils";

interface FeedSearchProps {
	className?: string;
}

const FeedSearch: React.FC<FeedSearchProps> = ({ className }) => {
	const { setSearchQuery, sortOrder, setSortOrder } = useFeedContext();

	// Debounce the search input to avoid rapid state updates
	const debouncedSetSearchQuery = React.useMemo(
		() => debounce(setSearchQuery, 300),
		[setSearchQuery],
	);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		debouncedSetSearchQuery(e.target.value);
	};

	// Cleanup debounce on unmount
	React.useEffect(() => {
		return () => {
			debouncedSetSearchQuery.cancel();
		};
	}, [debouncedSetSearchQuery]);

	return (
		<div
			className={cn(
				"relative flex items-center bg-card rounded-4xl m-auto flex-1",
				className,
			)}
		>
			<span className="absolute left-3 text-muted-foreground">
				<SearchIcon className="w-6 h-6" />
			</span>
			<SortDropdown
				value={sortOrder}
				onChange={setSortOrder}
				className="absolute right-1"
			/>
			<Input
				type="search"
				placeholder="Search..."
				className="px-12 py-6 rounded-4xl focus-visible:border-none"
				onChange={handleChange}
			/>
		</div>
	);
};

export default FeedSearch;
