import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { InsertImagePayload } from "../../plugins/ImagesPlugin";
import fetchGifs from "../../utils/gif";

export interface InsertGifProps {
	insertGifOnClick: (payload: InsertImagePayload) => void;
	onClose: () => void;
}

interface Gif {
	id: string;
	url: string;
	alt_text: string;
}

export default function InsertGif({
	insertGifOnClick,
	onClose,
}: InsertGifProps) {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);

		return () => clearTimeout(handler);
	}, [search]);

	const { data: gifs, isPending } = useQuery({
		queryKey: ["gifs", debouncedSearch],
		queryFn: async () => {
			const { gifs } = await fetchGifs({ q: debouncedSearch || "trending" });
			return gifs;
		},
	});

	return (
		<div className="flex flex-col space-y-1">
			<form onSubmit={(e) => e.preventDefault()} className="relative mb-3">
				<Button
					type="submit"
					className="absolute text-gray-500 left-1 top-[50%] -translate-y-1/2"
					variant="ghost"
					size="sm"
				>
					<Search className="w-4 h-4" />
				</Button>
				<Input
					onChange={(e) => setSearch(e.target.value)}
					value={search}
					placeholder="Search for GIFs"
					className="pl-9"
				/>
				{search && (
					<X
						onClick={() => setSearch("")}
						className="w-4 h-4 absolute cursor-pointer transition-colors text-gray-500 right-3 top-[50%] hover:text-white -translate-y-1/2"
					/>
				)}
			</form>

			<div className="grid grid-cols-3 gap-2">
				{isPending &&
					Array(9)
						.fill(0)
						.map((_, i) => (
							<Skeleton key={i} className="rounded-md w-full h-full" />
						))}

				{!isPending &&
					gifs?.map((gif: Gif) => (
						<button
							key={gif.id}
							onClick={() => {
								insertGifOnClick({ src: gif.url, altText: gif.alt_text });
								onClose();
							}}
							className="w-full h-full"
						>
							<img
								src={gif.url}
								alt={gif.alt_text}
								className="rounded-md w-full h-full"
							/>
						</button>
					))}

				{!isPending && gifs?.length === 0 && (
					<p className="text-center text-gray-500">No GIFs found</p>
				)}
			</div>
		</div>
	);
}
