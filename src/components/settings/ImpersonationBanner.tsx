"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { AlertTriangle, UserCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImpersonationBannerProps {
	className?: string;
}

export default function ImpersonationBanner({
	className,
}: ImpersonationBannerProps) {
	const { data } = useSession();
	const [isStoppingImpersonation, setIsStoppingImpersonation] = useState(false);

	// Check if the current session is being impersonated
	const isImpersonated = data?.session?.impersonatedBy;

	if (!isImpersonated) {
		return null;
	}

	const handleStopImpersonation = async () => {
		try {
			setIsStoppingImpersonation(true);
			await authClient.admin.stopImpersonating();
			toast.success("Stopped impersonating user");
			// Reload the page after stopping impersonation
			window.location.reload();
		} catch (error) {
			console.error("Failed to stop impersonation:", error);
			toast.error("Failed to stop impersonation");
		} finally {
			setIsStoppingImpersonation(false);
		}
	};

	return (
		<div
			className={cn(
				"fixed top-16 z-40 bg-orange-500 text-white px-4 py-2 shadow-lg rounded-4xl",
				className,
			)}
			style={{ left: "50%", transform: "translateX(-50%)" }}
		>
			<div className="flex items-center gap-3">
				<AlertTriangle className="h-4 w-4 flex-shrink-0" />
				<span className="font-medium text-sm">
					You are currently impersonating{" "}
					<span className="font-bold">{data?.user?.name}</span>
				</span>
				<Button
					onClick={handleStopImpersonation}
					disabled={isStoppingImpersonation}
					variant="outline"
					size="sm"
					className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-7 px-3"
				>
					{isStoppingImpersonation ? (
						<div className="flex items-center gap-1">
							<div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
							<span className="text-xs">Stopping...</span>
						</div>
					) : (
						<div className="flex items-center gap-1">
							<UserCheck className="h-3 w-3" />
							<span className="text-xs">Stop</span>
						</div>
					)}
				</Button>
			</div>
		</div>
	);
}
