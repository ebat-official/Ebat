import * as React from "react";
import { MagnifyingGlassIcon as SearchIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { useFeedContext } from "./FeedContext";
import { BsSortDownAlt } from "react-icons/bs";
import SortDropdown from "./SortDropDown";
import { debounce } from "lodash-es";

const FeedSearch: React.FC = () => {
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
		<div className="relative flex items-center bg-card w-[98%] rounded-4xl m-auto">
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
