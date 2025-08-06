"use client";

import {
	TrendingUp,
	Users,
	ThumbsUp,
	MessageSquare,
	Edit,
	ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-transition-progress/next";

interface KarmaEmptyStateProps {
	isModal?: boolean;
}

export function KarmaEmptyState({ isModal = false }: KarmaEmptyStateProps) {
	return (
		<div className={`w-full space-y-8 ${isModal ? "p-6" : ""}`}>
			{/* Hero Section */}
			<Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
				<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-800/20 dark:to-purple-800/20 rounded-full -translate-y-16 translate-x-16" />
				<div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-green-200/20 to-blue-200/20 dark:from-green-800/20 dark:to-blue-800/20 rounded-full translate-y-12 -translate-x-12" />

				<CardContent className="relative z-10 text-center p-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
						<TrendingUp className="h-8 w-8 text-white" />
					</div>
					<h2 className="text-3xl font-bold text-foreground mb-4">
						Start Your Karma Journey
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						Build your reputation by contributing valuable content and helping
						others. Every action counts towards your karma score.
					</p>
				</CardContent>
			</Card>

			{/* Karma Earning Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card className="group hover:shadow-lg transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-4 group-hover:scale-110 transition-transform">
							<Edit className="h-6 w-6 text-white" />
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							Create Posts
						</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Share tutorials, insights, and valuable content with the community
						</p>
					</CardContent>
				</Card>

				<Card className="group hover:shadow-lg transition-all duration-300 hover:border-green-200 dark:hover:border-green-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mb-4 group-hover:scale-110 transition-transform">
							<ThumbsUp className="h-6 w-6 text-white" />
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							Get Upvoted
						</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Receive positive votes from community members on your content
						</p>
					</CardContent>
				</Card>

				<Card className="group hover:shadow-lg transition-all duration-300 hover:border-purple-200 dark:hover:border-purple-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mb-4 group-hover:scale-110 transition-transform">
							<MessageSquare className="h-6 w-6 text-white" />
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							Helpful Comments
						</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Provide useful answers and engage in meaningful discussions
						</p>
					</CardContent>
				</Card>

				<Card className="group hover:shadow-lg transition-all duration-300 hover:border-orange-200 dark:hover:border-orange-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mb-4 group-hover:scale-110 transition-transform">
							<Users className="h-6 w-6 text-white" />
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							Community Help
						</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Help moderate content and improve the platform experience
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Action Section */}
			<Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
				<CardContent className="p-8">
					<div className="text-center mb-6">
						<h3 className="text-2xl font-bold text-foreground mb-2">
							Ready to Start?
						</h3>
						<p className="text-muted-foreground">
							Choose your first action and begin building your karma
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
						<Link href="/frontend/blogs/create" className="flex-1">
							<Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
								<Edit className="h-4 w-4 mr-2" />
								Create Your First Post
							</Button>
						</Link>
						<Link href="/frontend/blogs" className="flex-1">
							<Button
								variant="outline"
								className="w-full border-2 hover:bg-muted transition-all duration-300"
							>
								<MessageSquare className="h-4 w-4 mr-2" />
								Explore Content
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
