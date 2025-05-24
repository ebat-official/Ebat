import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NoSearchResultsImg from "@/assets/img/NoResultFound.webp";
import { usePathname } from "next/navigation";

interface NoSearchResultsProps {
	category: string;
}

const NoSearchResults: React.FC<NoSearchResultsProps> = ({ category }) => {
	const pathname = usePathname();

	return (
		<Card className="flex flex-col md:flex-row gap-4 items-center min-h-[60vh] justify-center">
			<CardContent className="flex flex-col gap-4 items-center">
				<h2 className="text-2xl font-semibold opacity-90">
					No {category}s found
				</h2>
				<p className="text-sm opacity-70">
					Try changing your filters or search terms.
				</p>
				<Link className="mt-4 " href={`${pathname}/create`}>
					<Button className="cursor-pointer" variant="outline">
						Create a {category}
					</Button>
				</Link>
			</CardContent>
			<CardContent className="flex flex-col gap-4 items-center">
				<Image
					src={NoSearchResultsImg}
					alt="No search results"
					width={300}
					height={300}
					className="mx-auto"
					priority
				/>
			</CardContent>
		</Card>
	);
};

export default NoSearchResults;
