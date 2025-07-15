"use client";
import "@excalidraw/excalidraw/index.css";
import Editor from "@/components/shared/Lexical Editor";
import { EditorProvider } from "@/components/shared/Lexical Editor/providers/EditorContext";
import React, { type FC, useEffect, useRef, useState } from "react";

// type pageProps = {};

// const page: FC<pageProps> = ({}) => {
// 	return <InfiniteScroll />;
// };

// export default page;

// import {
//   Excalidraw,
//   convertToExcalidrawElements,
// } from "@excalidraw/excalidraw";

// import "@excalidraw/excalidraw/index.css";

// const ExcalidrawWrapper: React.FC = () => {
//   console.info(
//     convertToExcalidrawElements([
//       {
//         type: "rectangle",
//         id: "rect-1",
//         width: 186.47265625,
//         height: 141.9765625,
//       },
//     ])
//   );
//   return (
//     <div style={{ height: "500px", width: "500px" }} className="custom-styles">
//       <Excalidraw />
//     </div>
//   );
// };
// export default ExcalidrawWrapper;

const InfiniteScroll = () => {
	const [numbers, setNumbers] = useState([...Array(20).keys()]); // Initial 20 numbers
	const [loading, setLoading] = useState(false);
	const observerRef = useRef(null);
	const observerRef2 = useRef(null);

	const loadMoreNumbers = () => {
		setLoading(true);
		setTimeout(() => {
			setNumbers((prevNumbers) => [
				...prevNumbers,
				...Array.from({ length: 20 }, (_, i) => prevNumbers.length + i),
			]);
			setLoading(false);
		}, 1000); // Simulate network delay
	};

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !loading) {
					loadMoreNumbers();
				}
			},
			{
				root: document.getElementById("scrollContainer"),
				rootMargin: "100px",
				threshold: 1.0,
			},
		);

		if (observerRef.current) {
			observer.observe(observerRef.current);
		}
		if (observerRef2.current) {
			observer.observe(observerRef2.current);
		}

		return () => {
			if (observerRef.current) {
				observer.unobserve(observerRef.current);
			}
		};
	}, [loading]);

	return (
		<div
			className="w-[700px] h-[700px] mx-auto mt-10 overflow-auto border border-gray-300 p-4"
			id="scrollContainer"
		>
			<h2 className="mb-4 text-xl font-semibold text-center">
				Infinite Scrolling Numbers
			</h2>
			{/* <div ref={observerRef2} className="h-10" /> */}
			{numbers.map((num, index) => (
				<div
					key={index}
					className="p-2 text-lg text-center border-b border-gray-200"
				>
					{num}
				</div>
			))}
			<div ref={observerRef} className="h-10" />
			{loading && <p className="text-center text-gray-500">Loading...</p>}
		</div>
	);
};
export default InfiniteScroll;
