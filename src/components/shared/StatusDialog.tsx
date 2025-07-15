import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SUCCESS } from "@/utils/contants";
import { ReactNode, useEffect } from "react";
import { FaCheck, FaCross } from "react-icons/fa";
import { FaSkullCrossbones } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { RxCross2 } from "react-icons/rx";
import { useReward } from "react-rewards";

type StatusDialogProps = {
	type?: "success" | "error";
	children: ReactNode;
	allowOutsideClick?: boolean;
	onClose?: () => void;
	enableAnimation?: boolean;
};

type StatusDialogSubComponents = {
	Title: React.FC<{ children: ReactNode }>;
	Content: React.FC<{ children: ReactNode }>;
	Footer: React.FC<{ children: ReactNode }>;
};

const StatusDialog: React.FC<StatusDialogProps> & StatusDialogSubComponents = ({
	type = SUCCESS,
	children,
	allowOutsideClick = false,
	onClose,
	enableAnimation = true,
}) => {
	const isSuccess = type === SUCCESS;
	const { reward: confettiReward, isAnimating: isConfettiAnimating } =
		useReward("rewardId", "confetti");
	useEffect(() => {
		if (isSuccess && enableAnimation) {
			setTimeout(() => {
				confettiReward();
			});
		}
	}, [isSuccess, enableAnimation]);
	return (
		<Dialog modal={!allowOutsideClick} open onOpenChange={onClose}>
			<DialogContent className="max-w-sm p-6 text-white border-none rounded-lg bg-linear-to-br from-gray-800 to-black ">
				<DialogHeader
					id="rewardId"
					className="absolute top-0 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 left-1/2"
				>
					{isSuccess ? (
						<div className="relative">
							{/* Glow Effect */}
							<div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-40" />

							<div className="bg-green-500 rounded-full p-4 flex justify-center items-center shadow-[0px_10px_30px_rgba(0,255,0,0.5)]">
								<FaCheck className="w-16 h-16 text-white" />
							</div>
						</div>
					) : (
						<div className="relative">
							{/* Glow Effect */}
							<div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-40" />

							<div className="bg-red-500 rounded-full p-4 flex justify-center items-center shadow-[0px_10px_30px_rgba(255,0,0,0.5)]">
								<ImCross className="font-medium text-white w-14 h-14" />
							</div>
						</div>
					)}
				</DialogHeader>

				<div className="flex flex-col gap-4 mt-8">{children}</div>
			</DialogContent>
		</Dialog>
	);
};

StatusDialog.Title = ({ children }) => (
	<h2 className="mt-4 text-lg font-bold text-center">{children}</h2>
);
StatusDialog.Content = ({ children }) => (
	<p className="font-medium text-center text-gray-300">{children}</p>
);
StatusDialog.Footer = ({ children }) => (
	<div className="flex justify-center mt-4">{children}</div>
);

export default StatusDialog;
