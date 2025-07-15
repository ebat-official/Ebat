"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import useFileUpload from "@/hooks/useFileUpload";
import { compressImage } from "@/utils/compressImage";
import { EditorFileUpload, UploadZone } from "@/utils/types";
import { AnimatePresence, motion } from "framer-motion";
import { Image, Loader2, Upload, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useEditorContext } from "../shared/Lexical Editor/providers/EditorContext";

// Utility to convert image URL to File
async function urlToFile(
	url: string,
	fileName: string,
	mimeType?: string,
): Promise<File> {
	const response = await fetch(url);
	const blob = await response.blob();
	return new File([blob], fileName, { type: mimeType || blob.type });
}

const zones: UploadZone[] = [
	{
		title: "Upload Images",
		subtitle: "Drop images here",
		icon: Image,
		gradient: "from-purple-400 via-pink-500 to-red-500",
		rotate: "-rotate-2",
	},
];

interface ThumbnailUploadProps {
	images?: string[];
	insertMedia: (file: { url: string; alt: string }) => void;
	closeHandler: () => void;
}

export const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({
	insertMedia,
	closeHandler,
	images = [],
}) => {
	const [draggedZone, setDraggedZone] = useState<number | null>(null);
	const [allImages, setAllImages] = useState<
		{ file: File; url: string; alt: string; type: string }[]
	>([]);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { uploadFile, progress } = useFileUpload();
	const { id: postId } = useEditorContext();

	// Convert URLs to File objects on mount
	useEffect(() => {
		async function convertImages() {
			const converted = await Promise.all(
				images.map(async (url, idx) => {
					const file = await urlToFile(url, `image-${idx}.webp`);
					return { file, url, alt: `image-${idx}.webp`, type: file.type };
				}),
			);
			setAllImages(converted);
		}
		if (images.length) convertImages();
	}, [images]);

	const handleDragEnter = (index: number) => (e: React.DragEvent) => {
		e.preventDefault();
		setDraggedZone(index);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDraggedZone(null);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDraggedZone(null);

		const droppedFiles = Array.from(e.dataTransfer.files);
		if (droppedFiles.length > 0) {
			await handleLocalFiles(droppedFiles);
		}
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		if (selectedFiles.length > 0) {
			await handleLocalFiles(selectedFiles);
		}
	};

	const handleLocalFiles = async (newFiles: File[]) => {
		const fileObjs = await Promise.all(
			newFiles.map(async (file) => ({
				file,
				url: URL.createObjectURL(file),
				alt: file.name,
				type: file.type,
			})),
		);
		setAllImages((prev) => {
			const updated = [...prev, ...fileObjs];
			// Select the first newly added image by default
			if (fileObjs.length > 0) {
				setSelectedIndex(updated.length - fileObjs.length);
			}
			return updated;
		});
	};

	const removeImage = (index: number) => {
		setAllImages((prev) => prev.filter((_, i) => i !== index));
		if (selectedIndex === index) setSelectedIndex(null);
	};

	const handleSave = async () => {
		if (selectedIndex == null) {
			insertMedia({ url: "", alt: "" });
			return;
		}
		const selected = allImages[selectedIndex];
		let uploaded: EditorFileUpload = {
			url: selected.url,
			alt: selected.alt,
			type: selected.type,
		};

		setUploading(true);
		const compressedImage = await compressImage(selected.file, {
			maxSizeMB: 0.03,
			maxWidthOrHeight: 400,
		});
		const { status, data } = await uploadFile(compressedImage, { postId });
		setUploading(false);
		if (status === "error") {
			toast.error(data.message);
			return;
		}
		uploaded = {
			url: data.url || "",
			alt: selected.alt,
			type: data.type || "",
		};

		insertMedia(uploaded);
	};

	return (
		<Card className="mx-auto w-full bg-transparent border-none overflow-hidden rounded-[1rem] relative">
			<CardHeader>
				<CardTitle className="text-center mb-2">
					Choose a thumbnail for your post
				</CardTitle>
				<CardDescription>
					Select or upload an image to use as the thumbnail for your post.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-6 py-7">
				<div className="flex justify-end mb-2 absolute top-1 right-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={closeHandler}
						className="w-8 h-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</Button>
				</div>
				<div className="grid justify-center grid-cols-1 gap-4 mb-6">
					{zones.map((zone, index) => (
						<div key={index} className={`relative ${zone.rotate}`}>
							<motion.div
								onClick={() => fileInputRef.current?.click()}
								onDragEnter={handleDragEnter(index)}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								whileHover={{ y: -4, scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="relative h-full group cursor-pointer"
							>
								<div
									className={`
                    absolute inset-0 -z-10 rounded-xl bg-linear-to-br ${
											zone.gradient
										}
                    opacity-0 blur-md transition-opacity duration-300 ${
											draggedZone === index
												? "opacity-70"
												: "group-hover:opacity-70"
										}
                  `}
								/>
								<Card className="relative h-full rounded-[1rem] overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 transition-colors duration-300 group-hover:border-transparent">
									<CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
										<motion.div
											whileHover={{ scale: 1.1, rotate: 10 }}
											className="p-3 mb-4 bg-gray-100 rounded-full dark:bg-gray-800"
										>
											<zone.icon className="w-8 h-8 text-gray-500" />
										</motion.div>
										<h3 className="mb-1 text-sm font-medium">{zone.title}</h3>
										<p className="text-xs text-gray-500">{zone.subtitle}</p>
									</CardContent>
								</Card>
							</motion.div>
						</div>
					))}
				</div>

				<div className="flex flex-wrap gap-2 mt-6 justify-center">
					{allImages.map((img, idx) => (
						<div
							key={img.url}
							onClick={() => setSelectedIndex(idx)}
							className={`cursor-pointer relative border-2 rounded-lg p-1 transition-colors group ${
								selectedIndex === idx
									? "border-green-500"
									: "border-transparent hover:border-gray-300"
							}`}
						>
							<img
								src={img.url}
								alt={img.alt}
								className="w-24 h-24 object-cover rounded"
							/>
							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									removeImage(idx);
								}}
								className="w-6 h-6 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-700 absolute top-1 right-1 hidden group-hover:flex"
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					))}
				</div>

				{/* Progress bar shown during upload */}
				{uploading && (
					<div className="w-full my-4">
						<Progress value={progress} />
						<div className="text-xs text-center mt-1">
							{Math.round(progress)}%
						</div>
					</div>
				)}

				<div className="flex flex-col text-center">
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileSelect}
						className="hidden"
						multiple
					/>
					<Button
						onClick={() => fileInputRef.current?.click()}
						disabled={uploading}
						className="rounded-[1rem] mt-5"
					>
						{uploading ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Uploading...
							</>
						) : (
							<>
								<Upload className="w-4 h-4 mr-2" />
								Choose Files
							</>
						)}
					</Button>

					<Button
						onClick={handleSave}
						disabled={uploading}
						className="rounded-[1rem] mt-4"
					>
						Continue
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
