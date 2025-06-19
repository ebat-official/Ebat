"use client";

import React, { useState, useRef, useEffect } from "react";
import { File, Folder } from "lucide-react";
import { DIRECTORY } from "./constants";
import type { FileKind } from "./types";

interface PendingFileItemProps {
	initialName?: string;
	kind: FileKind;
	onConfirm: (name: string) => void;
	onCancel: () => void;
	level: number;
}

export function PendingFileItem({
	initialName = "",
	kind,
	onConfirm,
	onCancel,
	level,
}: PendingFileItemProps) {
	const [name, setName] = useState(initialName);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, []);

	const handleSubmit = () => {
		const trimmedName = name.trim();
		if (trimmedName) {
			onConfirm(trimmedName);
		} else {
			onCancel();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		} else if (e.key === "Escape") {
			e.preventDefault();
			onCancel();
		}
	};

	return (
		<div
			className="flex items-center gap-2 px-3 py-1.5"
			style={{ paddingLeft: `${12 + level * 20}px` }}
		>
			<div className="w-4" /> {/* Space for expand/collapse button */}
			<div className="flex-shrink-0">
				{kind === DIRECTORY ? (
					<Folder className="w-4 h-4 text-primary" />
				) : (
					<File className="w-4 h-4 text-muted-foreground" />
				)}
			</div>
			<input
				ref={inputRef}
				type="text"
				value={name}
				onChange={(e) => setName(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={handleSubmit}
				className="flex-1 text-sm bg-background border border-primary/50 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
				placeholder={kind === DIRECTORY ? "Folder name" : "File name"}
			/>
		</div>
	);
}
