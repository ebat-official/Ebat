import { usePathname, useSearchParams } from "next/navigation";

function useCurrentURL() {
	const pathname = usePathname(); // Get the current pathname
	const searchParams = useSearchParams(); // Get current search parameters

	const currentURL = `${pathname}${searchParams ? `?${searchParams.toString()}` : ""}`;
	return currentURL;
}

export default useCurrentURL;
