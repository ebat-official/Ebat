"use client";

import { Lock, Shield, TrendingUp, Users } from "lucide-react";
import { FaYinYang } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-transition-progress/next";

export function ApprovalsLockedScreen() {
	return (
		<div className="flex flex-col items-center justify-center">
			<div className="flex flex-col items-center space-y-6 max-w-lg w-full">
				{/* Icon with gradient background */}
				<div className="relative">
					<div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center shadow-lg">
						<Lock className="h-12 w-12 text-muted-foreground" />
					</div>
					<div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
						<Shield className="h-5 w-5 text-primary-foreground" />
					</div>
				</div>

				{/* Main content */}
				<div className="text-center space-y-4">
					<h2 className="text-2xl font-bold text-foreground">
						Moderator Access Required
					</h2>
					<p className="text-muted-foreground text-md leading-relaxed">
						You need to be a moderator to approve posts and manage content.
					</p>
				</div>

				{/* How to become a moderator card */}
				<Card className="w-full border-2 border-dashed border-muted-foreground/20">
					<CardContent className="p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
								<FaYinYang className="h-4 w-4 text-white" />
							</div>
							<h3 className="font-semibold text-foreground">
								How to Become a Moderator
							</h3>
						</div>

						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
									<TrendingUp className="h-3 w-3 text-green-600" />
								</div>
								<div>
									<p className="font-medium text-sm text-foreground">
										Earn Karma Points
									</p>
									<p className="text-xs text-muted-foreground">
										Contribute quality content and help the community grow
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
									<Users className="h-3 w-3 text-blue-600" />
								</div>
								<div>
									<p className="font-medium text-sm text-foreground">
										Build Reputation
									</p>
									<p className="text-xs text-muted-foreground">
										Demonstrate consistent, helpful contributions
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
									<Shield className="h-3 w-3 text-purple-600" />
								</div>
								<div>
									<p className="font-medium text-sm text-foreground">
										Auto Promotion
									</p>
									<p className="text-xs text-muted-foreground">
										You'll be automatically promoted based on your karma points
									</p>
								</div>
							</div>
						</div>

						<div className="mt-6 pt-4 border-t border-muted">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Current Status:
								</span>
								<Badge
									variant="secondary"
									className="bg-yellow-100 text-yellow-800"
								>
									Community Member
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Action buttons */}
				<div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
					<Link href="/settings/karma" className="flex-1">
						<Button variant="outline" className="w-full">
							<TrendingUp className="h-4 w-4 mr-2" />
							View My Karma
						</Button>
					</Link>
					<Link href="/settings/profile" className="flex-1">
						<Button variant="outline" className="w-full">
							<Users className="h-4 w-4 mr-2" />
							My Profile
						</Button>
					</Link>
				</div>

				{/* Footer note */}
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Shield className="h-3 w-3" />
					<span>
						Moderator access is granted based on community contribution and
						trust
					</span>
				</div>
			</div>
		</div>
	);
}
