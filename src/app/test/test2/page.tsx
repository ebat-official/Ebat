"use client";
import React, { useEffect, useRef, useState } from "react";

export default function infiniteScroll() {
	const [numbers, setNumbers] = useState([...Array(20).keys()]);
	const [loading, setLoading] = useState(false);
	const observerRef = useRef(null);

	function loadMore() {
		setLoading(true);
		setTimeout(() => {
			setNumbers((prevNumbers) => [
				...prevNumbers,
				...Array.from({ length: 20 }, (_, i) => prevNumbers.length + i),
			]);
			setLoading(false);
		}, 1000);
	}

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !loading) {
					loadMore();
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

		return () => {
			if (observerRef.current) {
				observer.unobserve(observerRef.current);
			}
		};
	}, [loading]);

	return (
		<div className="w-screen h-screen bg-amber-300 flex justify-center ">
			<div
				className="w-96 h-96  bg-red-950 border-4 border-black overflow-auto mt-14 "
				id="scrollContainer"
			>
				<h1 className="text-amber-50 h-11 text-center text-2xl">
					Infinte Scrolling
				</h1>
				{numbers.map((number, index) => (
					<div
						key={index}
						className="border-t-2 border-black text-white text-center"
					>
						{number}{" "}
					</div>
				))}

				<div ref={observerRef} className="h-10">
					Loading.....
				</div>
			</div>
		</div>
	);
}
