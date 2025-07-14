"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import Image from "next/image";

import { cn } from "@/lib/utils";

function Avatar({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			className={cn(
				"relative flex size-8 shrink-0 overflow-hidden rounded-full",
				className,
			)}
			{...props}
		/>
	);
}

interface AvatarImageProps
	extends React.ComponentProps<typeof AvatarPrimitive.Image> {
	src?: string;
	alt?: string;
	width?: number;
	height?: number;
}

function AvatarImage({
	className,
	src,
	alt = "avatar",
	width = 32,
	height = 32,
	...props
}: AvatarImageProps) {
	// If src is provided, use Next.js Image for better cross-origin handling
	if (src) {
		return (
			<Image
				src={src}
				alt={alt}
				width={width}
				height={height}
				className={cn("aspect-square size-full object-cover", className)}
				referrerPolicy="no-referrer"
				{...props}
			/>
		);
	}

	// Fallback to regular img tag for cases where src might be undefined
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cn("aspect-square size-full", className)}
			{...props}
		/>
	);
}

function AvatarFallback({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cn(
				"bg-muted flex size-full items-center justify-center rounded-full",
				className,
			)}
			{...props}
		/>
	);
}

export { Avatar, AvatarImage, AvatarFallback };
