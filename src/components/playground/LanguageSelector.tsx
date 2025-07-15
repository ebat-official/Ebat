"use client";
import useMounted from "@/hooks/useMounted";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon, Lock, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LANGUAGE_CONFIG } from "./constants";

function LanguageSelector({ hasAccess }: { hasAccess: boolean }) {
	const [isOpen, setIsOpen] = useState(false);
	const mounted = useMounted();

	const { language, setLanguage } = useCodeEditorStore();
	const dropdownRef = useRef<HTMLDivElement>(null);
	const currentLanguageObj = LANGUAGE_CONFIG[language];

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLanguageSelect = (langId: string) => {
		if (!hasAccess && langId !== "javascript") return;

		setLanguage(langId);
		setIsOpen(false);
	};

	if (!mounted) return null;

	return (
		<div className="relative" ref={dropdownRef}>
			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={() => setIsOpen(!isOpen)}
				className={`group relative flex items-center gap-3 p-2 bg-card 
      rounded-lg transition-all 
       duration-200
       ${!hasAccess && language !== "javascript" ? "opacity-50 cursor-not-allowed" : ""}`}
			>
				{/* Decoration */}
				<div
					className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/5 
        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
					aria-hidden="true"
				/>

				<div className=" rounded-md p-0.5 group-hover:scale-110 transition-transform">
					<Image
						src={currentLanguageObj.logoPath}
						alt="programming language logo"
						width={16}
						height={16}
						className="w-full h-full object-contain relative z-10"
					/>
				</div>

				<span className="  text-left text-sm transition-colors">
					{currentLanguageObj.label}
				</span>

				<ChevronDownIcon
					className={`size-4 text-gray-400 transition-all duration-300 
            ${isOpen ? "rotate-180" : ""}`}
				/>
			</motion.button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 8, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 8, scale: 0.96 }}
						transition={{ duration: 0.2 }}
						className="absolute top-full left-0 mt-2 w-48 bg-card backdrop-blur-xl
           rounded-xl border shadow-2xl py-2 z-50"
					>
						<div className="px-3 pb-2 mb-2 border-b border-gray-600/40">
							<p className="text-xs font-medium text-gray-500 dark:text-gray-400">
								Select Language
							</p>
						</div>

						<div className="max-h-[280px] overflow-y-auto overflow-x-hidden">
							{Object.values(LANGUAGE_CONFIG).map((lang, index) => {
								const isLocked = !hasAccess && lang.id !== "javascript";

								return (
									<motion.div
										key={lang.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: index * 0.1 }}
										className="relative group px-2"
									>
										<button
											className={`
                      relative w-full flex items-center gap-3 p-1.5 rounded-lg transition-all duration-200
                      ${language === lang.id ? "bg-blue-500/10 text-blue-400" : ""}
                      ${isLocked ? "opacity-50" : "hover:bg-red"}
                    `}
											onClick={() => handleLanguageSelect(lang.id)}
											disabled={isLocked}
										>
											{/* decorator */}
											<div
												className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg 
                      opacity-0 group-hover:opacity-100 transition-opacity"
											/>

											<div
												className={`
                         relative  rounded-lg p-1.5 group-hover:scale-110 transition-transform
                         ${language === lang.id ? "bg-blue-500/10" : ""}
                       `}
											>
												<div
													className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg 
                        opacity-0 group-hover:opacity-100 transition-opacity"
												/>
												<Image
													width={16}
													height={16}
													src={lang.logoPath}
													alt={`${lang.label} logo`}
													className="w-full h-full object-contain relative z-10"
												/>
											</div>

											<span className="flex-1 text-left group-hover:opacity-60 transition-colors">
												{lang.label}
											</span>

											{/* selected language border */}
											{language === lang.id && (
												<motion.div
													className="absolute inset-0 border-2 border-blue-500/30 rounded-lg"
													transition={{
														type: "spring",
														bounce: 0.2,
														duration: 0.6,
													}}
												/>
											)}

											{isLocked ? (
												<Lock className="w-4 h-4 text-gray-500" />
											) : (
												language === lang.id && (
													<Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
												)
											)}
										</button>
									</motion.div>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
export default LanguageSelector;
