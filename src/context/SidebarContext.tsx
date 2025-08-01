"use client";
import { SidebarConfigType, getSidebarConfig } from "@/lib/sidebarConfig";
import { PostCategory } from "@/db/schema/enums";
import React, { createContext, useContext, useState, ReactNode } from "react";

type SidebarSettings = { disabled: boolean; isHoverOpen: boolean };
type SidebarContextType = {
	isOpen: boolean;
	isHover: boolean;
	mobileNav: boolean;
	settings: SidebarSettings;
	currentCategory: PostCategory;
	toggleOpen: () => void;
	setIsOpen: (isOpen: boolean) => void;
	setIsHover: (isHover: boolean) => void;
	setMobileNav: (open: boolean) => void;
	setCurrentCategory: (category: PostCategory) => void;
	getOpenState: () => boolean;
	setSettings: (settings: Partial<SidebarSettings>) => void;
	config: SidebarConfigType;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({
	children,
	className,
}: { children: ReactNode; className?: string }) => {
	const [isOpen, setIsOpen] = useState(true);
	const [isHover, setIsHover] = useState(false);
	const [mobileNav, setMobileNav] = useState(false);
	const [settings, setSettings] = useState<SidebarSettings>({
		disabled: false,
		isHoverOpen: false,
	});
	const [currentCategory, setCurrentCategory] = useState<PostCategory>(
		PostCategory.FRONTEND,
	);
	const [sideBarConfig, setSideBarConfig] = useState<SidebarConfigType>(
		getSidebarConfig(currentCategory),
	);

	const toggleOpen = () => {
		setIsOpen(!isOpen);
	};

	const getOpenState = () => {
		return isOpen || (settings.isHoverOpen && isHover);
	};

	const updateSettings = (newSettings: Partial<SidebarSettings>) => {
		setSettings((prevSettings) => ({ ...prevSettings, ...newSettings }));
	};

	const updateCurrentCategory = (category: PostCategory) => {
		setCurrentCategory(category);
		setSideBarConfig(getSidebarConfig(category));
	};

	return (
		<SidebarContext.Provider
			value={{
				isOpen,
				isHover,
				mobileNav,
				settings,
				currentCategory,
				toggleOpen,
				setIsOpen,
				setIsHover,
				setMobileNav,
				setCurrentCategory: updateCurrentCategory,
				getOpenState,
				setSettings: updateSettings,
				config: sideBarConfig,
			}}
		>
			<div className={className}>{children}</div>
		</SidebarContext.Provider>
	);
};

export const useSidebar = () => {
	const context = useContext(SidebarContext);
	if (context === undefined) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
};
