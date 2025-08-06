"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { KarmaHistory } from "@/components/settings/KarmaHistory";
import { KarmaProgress } from "@/components/settings/KarmaProgress";
import { KarmaEmptyState } from "@/components/settings/KarmaEmptyState";
import { UserRole } from "@/db/schema/enums";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

export default function KarmaPage() {
	const { data: session } = useSession();
	const [showKarmaInfo, setShowKarmaInfo] = useState(false);
	const userKarma =
		(session?.user as { karmaPoints?: number })?.karmaPoints || 0;
	const userRole =
		(session?.user as { role?: UserRole })?.role || UserRole.USER;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Karma</h1>
					<p className="text-muted-foreground">
						Track your karma points and see your contribution history.
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowKarmaInfo(true)}
					className="flex items-center gap-2"
				>
					<Info className="h-4 w-4" />
					Learn more about karma
				</Button>
			</div>

			<div className="grid gap-6">
				<KarmaProgress karma={userKarma} currentRole={userRole} />
				<KarmaHistory />
			</div>

			{/* Karma Info Modal */}
			<Dialog open={showKarmaInfo} onOpenChange={setShowKarmaInfo}>
				<DialogContent className="!max-w-[95vw] !w-[95vw] !h-[95vh] max-h-[95vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Learn About Karma</DialogTitle>
						<DialogDescription>
							Discover how to earn karma points and build your reputation.
						</DialogDescription>
					</DialogHeader>
					<KarmaEmptyState isModal={true} />
				</DialogContent>
			</Dialog>
		</div>
	);
}
