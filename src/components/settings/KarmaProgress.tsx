"use client";

import { useSession } from "@/lib/auth-client";
import { getNextRoleMilestone, getRoleMilestones } from "@/auth/roleUtils";
import { UserRole } from "@/db/schema/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Shield, Crown, Target } from "lucide-react";
import { FaYinYang } from "react-icons/fa";

interface KarmaProgressProps {
	karma: number;
	currentRole: UserRole;
}

const getRoleIcon = (role: UserRole) => {
	switch (role) {
		case UserRole.EDITOR:
			return <FaYinYang className="h-4 w-4" />;
		case UserRole.MODERATOR:
			return <Shield className="h-4 w-4" />;
		case UserRole.ADMIN:
		case UserRole.SUPER_ADMIN:
			return <Crown className="h-4 w-4" />;
		default:
			return <TrendingUp className="h-4 w-4" />;
	}
};

const getRoleColor = (role: UserRole) => {
	switch (role) {
		case UserRole.EDITOR:
			return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
		case UserRole.MODERATOR:
			return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800";
		case UserRole.ADMIN:
		case UserRole.SUPER_ADMIN:
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
		default:
			return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
	}
};

const getRoleLabel = (role: UserRole) => {
	switch (role) {
		case UserRole.USER:
			return "Community Member";
		case UserRole.EDITOR:
			return "Editor";
		case UserRole.MODERATOR:
			return "Moderator";
		case UserRole.ADMIN:
			return "Admin";
		case UserRole.SUPER_ADMIN:
			return "Super Admin";
		default:
			return "User";
	}
};

// Calculate total progress across the entire journey (0 to 2000 karma)
const calculateTotalProgress = (karma: number) => {
	if (karma <= 100) {
		// First phase: 0-100 karma = 50% of total progress
		return (karma / 100) * 50;
	}
	if (karma <= 2000) {
		// Second phase: 100-2000 karma = remaining 50% of total progress
		return 50 + ((karma - 100) / (2000 - 100)) * 50;
	}
	// Cap at 100%
	return 100;
};

// Get the effective role for display (cap at Moderator for progress)
const getEffectiveRole = (role: UserRole) => {
	if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
		return UserRole.MODERATOR;
	}
	return role;
};

export function KarmaProgress({ karma, currentRole }: KarmaProgressProps) {
	const { nextRole, requiredKarma, progress } = getNextRoleMilestone(
		karma,
		currentRole,
	);
	const effectiveRole = getEffectiveRole(currentRole);
	const totalProgress = calculateTotalProgress(karma);

	return (
		<Card>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
							<Target className="h-5 w-5 text-primary-foreground" />
						</div>
						<div>
							<CardTitle className="text-lg">Karma Progress</CardTitle>
							<p className="text-sm text-muted-foreground">
								Your journey through the community ranks
							</p>
						</div>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-foreground">
							{karma.toLocaleString()}
						</div>
						<div className="text-sm text-muted-foreground">total karma</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Current Role Badge */}
				<div className="flex items-center gap-3">
					<Badge
						className={`${getRoleColor(currentRole)} flex items-center gap-2 px-3 py-1`}
					>
						{getRoleIcon(currentRole)}
						{getRoleLabel(currentRole)}
					</Badge>
					{nextRole && (
						<div className="text-sm text-muted-foreground">
							→ {getRoleLabel(nextRole)} ({requiredKarma - karma} more needed)
						</div>
					)}
				</div>

				<Separator />

				{/* Role Progression Path */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-foreground">
							Role Progression
						</span>
						<span className="text-sm text-muted-foreground">
							{Math.floor(totalProgress)}% Complete
						</span>
					</div>

					{/* Progress Bar */}
					<Progress
						value={totalProgress}
						className="h-3 bg-blue-500/20 [&_[data-slot=progress-indicator]]:blue-gradient"
					/>

					{/* Role Path Visualization */}
					<div className="grid grid-cols-3 gap-4 mt-6">
						{/* Community Member */}
						<div className="flex flex-col items-center text-center">
							<div
								className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
									karma >= 0 ? "bg-green-500" : "bg-muted"
								}`}
							>
								<TrendingUp className="h-6 w-6 text-white" />
							</div>
							<div className="text-sm font-medium text-foreground">
								Community
							</div>
							<div className="text-xs text-muted-foreground">0 karma</div>
							{karma >= 0 && karma < 100 && (
								<div className="mt-1">
									<Badge variant="secondary" className="text-xs">
										Current
									</Badge>
								</div>
							)}
						</div>

						{/* Editor */}
						<div className="flex flex-col items-center text-center">
							<div
								className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
									karma >= 100 ? "bg-blue-500" : "bg-muted"
								}`}
							>
								<FaYinYang className="h-6 w-6 text-white" />
							</div>
							<div className="text-sm font-medium text-foreground">Editor</div>
							<div className="text-xs text-muted-foreground">100 karma</div>
							{karma >= 100 && karma < 2000 && (
								<div className="mt-1">
									<Badge variant="secondary" className="text-xs">
										Current
									</Badge>
								</div>
							)}
						</div>

						{/* Moderator */}
						<div className="flex flex-col items-center text-center">
							<div
								className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
									karma >= 2000 ? "bg-purple-500" : "bg-muted"
								}`}
							>
								<Shield className="h-6 w-6 text-white" />
							</div>
							<div className="text-sm font-medium text-foreground">
								Moderator
							</div>
							<div className="text-xs text-muted-foreground">2000 karma</div>
							{karma >= 2000 && (
								<div className="mt-1">
									<Badge variant="secondary" className="text-xs">
										Current
									</Badge>
								</div>
							)}
						</div>
					</div>

					{/* Next Milestone Info */}
					{nextRole && (
						<div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 mb-2">
								<Target className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium text-foreground">
									Next Milestone: {getRoleLabel(nextRole)}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground">
									{karma} / {requiredKarma} karma points
								</span>
								<span className="text-xs text-muted-foreground">
									{requiredKarma - karma} more needed
								</span>
							</div>
						</div>
					)}

					{/* Max Level Reached */}
					{!nextRole &&
						(currentRole === UserRole.MODERATOR ||
							currentRole === UserRole.ADMIN ||
							currentRole === UserRole.SUPER_ADMIN) && (
							<div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
								<div className="flex items-center gap-2">
									<Crown className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium text-foreground">
										Maximum Level Reached
									</span>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									You've reached the highest role achievable through karma
								</p>
							</div>
						)}
				</div>
			</CardContent>
		</Card>
	);
}
