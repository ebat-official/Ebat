"use client";

import { User } from "@/db/schema/zod-schemas";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { formatNumInK } from "@/utils/formatNumInK";
import fallbackImg from "@/assets/img/avatarFallback.webp";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { followAction, isFollowing } from "@/actions/follow";
import { useServerAction } from "@/hooks/useServerAction";
import { toast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import { FollowAction } from "@/db/schema";
import { useAuthAction } from "@/hooks/useAuthAction";
import {
	FaLinkedin,
	FaGithub,
	FaTwitter,
	FaGlobe,
	FaYinYang,
} from "react-icons/fa";
import { SiLinkedin, SiGithub } from "react-icons/si";
import { UserRole } from "@/db/schema/enums";
import {
	UserPlus,
	UserCheck,
	Crown,
	Shield,
	Edit,
	UserIcon,
	Building2,
	Briefcase,
	Zap,
} from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuthorProfileCardProps {
	author: Pick<
		User,
		| "id"
		| "name"
		| "username"
		| "companyName"
		| "image"
		| "karmaPoints"
		| "description"
		| "role"
		| "jobTitle"
		| "externalLinks"
	>;
}

const AuthorProfileCard = ({ author }: AuthorProfileCardProps) => {
	const { data: user } = useSession();
	const isCurrentUser = user?.user?.id === author.id;
	const [isFollowingState, setIsFollowingState] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [runFollowAction] = useServerAction(followAction);
	const { executeAction, renderLoginModal } = useAuthAction({
		requireAuth: true,
		authMessage: "Please sign in to follow users.",
	});

	useEffect(() => {
		async function fetchIsFollowing() {
			if (!user?.user?.id) return;
			const following = await isFollowing(author.id);
			setIsFollowingState(following);
		}
		fetchIsFollowing();
	}, [author.id, user?.user?.id]);

	const handleFollowClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		executeAction(async () => {
			setLoading(true);
			const prev = isFollowingState;
			setIsFollowingState(!prev);
			try {
				const action = prev ? FollowAction.UNFOLLOW : FollowAction.FOLLOW;
				const res = await runFollowAction({
					followedUserId: author.id,
					action,
				});
				if (res.status !== "success") {
					setIsFollowingState(prev);
					toast({
						description: res.data?.message || "Action failed",
						variant: "destructive",
					});
				}
			} catch (e) {
				setIsFollowingState(prev);
				toast({ description: "Something went wrong", variant: "destructive" });
			} finally {
				setLoading(false);
			}
		});
	};

	const handleExternalLinkClick = (url: string) => {
		if (url) {
			window.open(url, "_blank", "noopener,noreferrer");
		}
	};

	const getExternalLinkIcon = (type: string) => {
		switch (type.toLowerCase()) {
			case "linkedin":
				return <SiLinkedin className="w-4 h-4" />;
			case "github":
				return <SiGithub className="w-4 h-4" />;
			case "twitter":
				return <FaTwitter className="w-4 h-4" />;
			default:
				return <FaGlobe className="w-4 h-4" />;
		}
	};

	const getRoleIcon = (role: string) => {
		switch (role) {
			case UserRole.SUPER_ADMIN:
				return <Crown className="w-4 h-4 text-yellow-600" />;
			case UserRole.ADMIN:
				return <Zap className="w-4 h-4 text-orange-600" />;
			case UserRole.MODERATOR:
				return <Shield className="w-4 h-4 text-purple-600" />;
			case UserRole.EDITOR:
				return <Edit className="w-4 h-4 text-blue-600" />;
			case UserRole.USER:
			default:
				return <UserIcon className="w-4 h-4 text-gray-600" />;
		}
	};

	const getRoleLabel = (role: string) => {
		switch (role) {
			case UserRole.SUPER_ADMIN:
				return "Super Admin";
			case UserRole.ADMIN:
				return "Admin";
			case UserRole.MODERATOR:
				return "Moderator";
			case UserRole.EDITOR:
				return "Editor";
			case UserRole.USER:
			default:
				return "Member";
		}
	};

	// Filter and limit external links
	const validExternalLinks =
		author.externalLinks && Array.isArray(author.externalLinks)
			? author.externalLinks
					.filter((link: any) => link?.value && link.value.trim() !== "")
					.slice(0, 4)
			: [];

	return (
		<Card className="min-w-80 max-w-96 p-6 bg-card border shadow-lg">
			<div className="flex items-start justify-between mb-4">
				{/* Avatar and Basic Info */}
				<div className="flex items-start gap-3 min-w-0 flex-1">
					<Avatar className="w-12 h-12 flex-shrink-0 border-2 border-yellow-400">
						<AvatarImage
							src={author?.image || undefined}
							alt={author.name || "avatar"}
							referrerPolicy="no-referrer"
						/>
						<AvatarFallback>
							<Image
								className="rounded-full outline-hidden"
								src={fallbackImg}
								alt="author"
							/>
						</AvatarFallback>
					</Avatar>

					<div className="flex flex-col gap-1 min-w-0 flex-1">
						<div className="flex items-center gap-2 min-w-0">
							<h3 className="font-bold text-base text-foreground truncate min-w-0">
								{author.name || "Anonymous Author"}
							</h3>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<span className="text-sm cursor-help flex-shrink-0">
											{getRoleIcon(author.role)}
										</span>
									</TooltipTrigger>
									<TooltipContent>
										<p>{getRoleLabel(author.role)}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						{/* Username */}
						<p className="text-sm text-muted-foreground truncate">
							{author.username?.startsWith("@")
								? author.username
								: `@${author.username || "anonymous"}`}
						</p>

						{/* Job Title */}
						{author.jobTitle && (
							<p className="text-sm text-muted-foreground truncate capitalize flex items-center gap-1">
								<Briefcase className="w-3 h-3 text-muted-foreground" />
								{author.jobTitle}
							</p>
						)}

						{/* Company Name with capitalize */}
						{author.companyName && (
							<p className="text-sm text-muted-foreground truncate capitalize flex items-center gap-1">
								<Building2 className="w-3 h-3 text-muted-foreground" />
								{author.companyName}
							</p>
						)}
					</div>
				</div>

				{/* Follow Button Icon with Animation */}
				{!isCurrentUser && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									onClick={handleFollowClick}
									disabled={loading}
									variant="ghost"
									size="sm"
									className="flex-shrink-0 p-2 h-10 w-10 rounded-full hover:bg-muted ml-2 transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-muted hover:border-primary/20"
								>
									{isFollowingState ? (
										<div className="flex items-center justify-center w-full h-full rounded-full bg-green-50 dark:bg-green-950/20">
											<UserCheck className="w-4 h-4 text-green-600 transition-all duration-200" />
										</div>
									) : (
										<div className="flex items-center justify-center w-full h-full rounded-full bg-blue-50 dark:bg-blue-950/20">
											<UserPlus className="w-4 h-4 text-blue-600 transition-all duration-200" />
										</div>
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{isFollowingState ? "Unfollow" : "Follow"}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>

			<CardContent className="p-0 space-y-4">
				{/* Description */}
				{author.description && (
					<p className="text-sm text-muted-foreground leading-relaxed">
						{String(author.description)}
					</p>
				)}

				{/* Karma Points with Role */}
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm font-medium">
						<FaYinYang className="w-3 h-3 text-muted-foreground" />
						<span className="text-muted-foreground">
							{formatNumInK(author.karmaPoints || 0)} Karma
						</span>
					</div>

					{/* Role Badge */}
					<div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm font-medium">
						{getRoleIcon(author.role)}
						<span className="text-muted-foreground">
							{getRoleLabel(author.role)}
						</span>
					</div>
				</div>

				{/* External Links - Only show if there are valid links */}
				{validExternalLinks.length > 0 && (
					<div className="flex items-center gap-2 pt-2 border-t border-border">
						{validExternalLinks.map((link: any, index) => (
							<button
								key={index}
								type="button"
								onClick={() => handleExternalLinkClick(link.value)}
								className="p-2 rounded-full hover:bg-muted transition-all duration-200 hover:scale-110 text-muted-foreground hover:text-foreground"
								title={`Visit ${link.type}`}
							>
								{getExternalLinkIcon(link.type)}
							</button>
						))}
					</div>
				)}
			</CardContent>
			{renderLoginModal()}
		</Card>
	);
};

export default AuthorProfileCard;
