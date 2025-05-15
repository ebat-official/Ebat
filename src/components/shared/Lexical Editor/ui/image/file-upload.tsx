"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Loader2, X, Image, UploadCloudIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import useFileUpload from "@/hooks/useFileUpload";
import { toast } from "sonner";
import { zones } from "./constants";
import { useEditorContext } from "../../providers/EditorContext";
import { EditorFileUpload } from "@/utils/types";
import { compressImage } from "@/utils/compressImage";

interface FileUploadZoneProps {
	InsertMedia: (files: { url: string; alt: string }[]) => void;
	closeHandler: () => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
	InsertMedia,
	closeHandler,
}) => {
	const [draggedZone, setDraggedZone] = useState<number | null>(null);
	const [files, setFiles] = useState<EditorFileUpload[]>([]);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { uploadFile, progress } = useFileUpload();
	const { id: postId, addFilesToContext } = useEditorContext();

	useEffect(() => {
		if (files.length > 0) {
			addFilesToContext(files);
		}
	}, [files]);

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
			await upload(droppedFiles);
		}
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		if (selectedFiles.length > 0) {
			await upload(selectedFiles);
		}
	};

	const upload = async (newFiles: File[]) => {
		setUploading(true);

		const uploadedFiles: EditorFileUpload[] = [];

		for (const file of newFiles) {
			const compressedImage = await compressImage(file);
			try {
				const { status, data } = await uploadFile(compressedImage, { postId });
				if (status === "error") throw new Error(data.message);
				uploadedFiles.push({
					url: data.url || "",
					alt: file.name,
					type: data.type || "",
				});
			} catch (error) {
				closeHandler();
				const errMsg = `Error uploading file "${file.name}": ${
					error instanceof Error ? error.message : "Unknown error"
				}`;
				console.error(errMsg);
				toast.error(errMsg);
			}
		}
		setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
		setUploading(false);
	};

	const removeFile = (index: number) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
	};

	return (
		<Card className="mx-auto w-full bg-transparent border-none overflow-hidden rounded-[1rem]">
			<CardContent className="p-6 py-7">
				<div className="grid justify-center grid-cols-1 gap-4 mb-6">
					{zones.map((zone, index) => (
						<div key={index} className={`relative ${zone.rotate}`}>
							<motion.div
								onDragEnter={handleDragEnter(index)}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								whileHover={{ y: -4, scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="relative h-full group"
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

				{(uploading || files.length > 0) && (
					<div className="mb-6">
						<Progress value={uploading ? progress : 100} className="h-2 mb-2" />
						<p className="mb-2 text-sm text-gray-500">
							{uploading
								? `Uploading... ${progress}%`
								: `${files.length} file(s) uploaded`}
						</p>
						<AnimatePresence>
							{files.map((file, index) => (
								<motion.div
									key={`${file.alt}-${index}`}
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-[1rem] p-2 mb-2"
								>
									<span className="truncate max-w-[80%] text-sm text-gray-700 dark:text-gray-300 ml-2">
										{file.alt}
									</span>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => removeFile(index)}
										className="w-6 h-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
									>
										<X className="w-4 h-4" />
									</Button>
								</motion.div>
							))}
						</AnimatePresence>
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

					{files.length > 0 && (
						<Button
							onClick={() => InsertMedia(files)}
							disabled={uploading}
							className="rounded-[1rem] mt-2"
						>
							Insert the {files.length === 1 ? "image" : "images"}
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default FileUploadZone;
