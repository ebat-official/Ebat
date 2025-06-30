import React, { FC } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Play, Loader2, Eye, Terminal } from "lucide-react";

interface ChallengeStartModalProps {
	onStart: () => void;
}

export const ChallengeStartModal: FC<ChallengeStartModalProps> = ({
	onStart,
}) => {
	return (
		<Card className="h-full flex flex-col justify-center rounded-none border-none">
			<CardContent className="text-center space-y-4 flex-1 flex flex-col gap-8 justify-center items-center">
				<div className="flex flex-col gap-2">
					<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
						<Code2 className="w-8 h-8 text-white" />
					</div>
					<CardTitle className="text-xl">Ready for the Challenge?</CardTitle>
				</div>
				<Button onClick={onStart} size="lg" className="px-6 w-fit">
					<Play className="w-4 h-4 mr-2" />
					Start Challenge
				</Button>
			</CardContent>
		</Card>
	);
};
