import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Clock, Target, Trophy } from "lucide-react";
import React, { useEffect } from "react";
import { useReward } from "react-rewards";

interface SubmissionSuccessModalProps {
	isOpen: boolean;
	onClose: () => void;
	runtime: number;
	numTestsPassed: number;
	numTotalTests: number;
}

export function SubmissionSuccessModal({
	isOpen,
	onClose,
	runtime,
	numTestsPassed,
	numTotalTests,
}: SubmissionSuccessModalProps) {
	const { reward: confettiReward } = useReward("successRewardId", "confetti");

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				confettiReward();
			}, 300); // Small delay to ensure modal is fully rendered
		}
	}, [isOpen, confettiReward]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-green-600">
						<Trophy className="w-6 h-6" />
						Congratulations! 🎉
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-6 py-4">
					<div className="text-center">
						<div id="successRewardId" className="relative">
							<CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
						</div>
						<h3 className="text-lg font-semibold mb-2">
							Challenge Completed Successfully!
						</h3>
						<p className="text-muted-foreground">
							Great job! You've successfully solved this challenge.
						</p>
					</div>

					<div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Target className="w-4 h-4 text-green-600" />
								<span className="text-sm font-medium">Tests Passed</span>
							</div>
							<span className="text-sm font-semibold text-green-600">
								{numTestsPassed}/{numTotalTests}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Clock className="w-4 h-4 text-green-600" />
								<span className="text-sm font-medium">Runtime</span>
							</div>
							<span className="text-sm font-semibold text-green-600">
								{runtime}ms
							</span>
						</div>
					</div>

					<div className="text-center text-sm text-muted-foreground">
						Your solution has been submitted and all test cases passed!
					</div>
				</div>

				<div className="flex justify-center">
					<Button onClick={onClose} className="w-full">
						Continue
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
