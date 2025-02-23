import { ReactNode, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImCross } from "react-icons/im";
import { RxCross2 } from "react-icons/rx";
import { FaCheck, FaCross } from "react-icons/fa";
import { SUCCESS } from "@/utils/contants";
import { FaSkullCrossbones } from "react-icons/fa";
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
		console.log(isSuccess, enableAnimation, "pp");
		if (isSuccess && enableAnimation) {
			setTimeout(() => {
				confettiReward();
			});
		}
	}, [isSuccess, enableAnimation]);
	return (
		<Dialog modal={!allowOutsideClick} open onOpenChange={onClose}>
			<DialogContent
				hideCloseButton
				className="max-w-sm p-6 rounded-lg bg-gradient-to-br from-gray-800 to-black text-white border-none "
			>
				<DialogHeader
					id="rewardId"
					className="flex items-center justify-center flex-col absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
				>
					{isSuccess ? (
						<div className="relative">
							{/* Glow Effect */}
							<div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-40" />

							<div className="bg-green-500 rounded-full p-4 flex justify-center items-center shadow-[0px_10px_30px_rgba(0,255,0,0.5)]">
								<FaCheck className="text-white w-16 h-16" />
							</div>
						</div>
					) : (
						<div className="relative">
							{/* Glow Effect */}
							<div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-40" />

							<div className="bg-red-500 rounded-full p-4 flex justify-center items-center shadow-[0px_10px_30px_rgba(255,0,0,0.5)]">
								<ImCross className="text-white w-14 h-14 font-medium" />
							</div>
						</div>
					)}
				</DialogHeader>

				<div className="mt-8 flex flex-col gap-4">{children}</div>
			</DialogContent>
		</Dialog>
	);
};

StatusDialog.Title = ({ children }) => (
	<h2 className="mt-4 text-lg font-semibold text-center">{children}</h2>
);
StatusDialog.Content = ({ children }) => (
	<p className="text-center text-gray-300">{children}</p>
);
StatusDialog.Footer = ({ children }) => (
	<div className="flex justify-center mt-4">{children}</div>
);

export default StatusDialog;
