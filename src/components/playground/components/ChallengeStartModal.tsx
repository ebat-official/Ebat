import React, { FC } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Play, Loader2, Eye, Terminal } from "lucide-react";
import { PostWithExtraDetails } from "@/utils/types";

interface ChallengeStartModalProps {
	post: PostWithExtraDetails;
	onStart: () => void;
	isLoading?: boolean;
}

export const ChallengeStartModal: FC<ChallengeStartModalProps> = ({
	post,
	onStart,
	isLoading = false,
}) => {
	return (
		<Card className="h-full flex flex-col justify-center">
			<CardHeader className="text-center">
				<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
					<Code2 className="w-8 h-8 text-white" />
				</div>
				<CardTitle className="text-xl">Ready for the Challenge?</CardTitle>
				<CardDescription className="text-base">{post.title}</CardDescription>
			</CardHeader>

			<CardContent className="text-center space-y-4 flex-1">
				<div className="grid grid-cols-3 gap-2 text-xs">
					<div className="p-2 bg-muted rounded-lg">
						<Code2 className="w-5 h-5 mx-auto mb-1" />
						<div>Code Editor</div>
					</div>
					<div className="p-2 bg-muted rounded-lg">
						<Eye className="w-5 h-5 mx-auto mb-1" />
						<div>Live Preview</div>
					</div>
					<div className="p-2 bg-muted rounded-lg">
						<Terminal className="w-5 h-5 mx-auto mb-1" />
						<div>Terminal</div>
					</div>
				</div>

				<p className="text-muted-foreground text-sm">
					Click start to launch your coding environment with WebContainer
					technology
				</p>
			</CardContent>

			<CardFooter className="flex justify-center">
				<Button
					onClick={onStart}
					disabled={isLoading}
					size="lg"
					className="px-6"
				>
					{isLoading ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							Setting up environment...
						</>
					) : (
						<>
							<Play className="w-4 h-4 mr-2" />
							Start Challenge
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);
};
