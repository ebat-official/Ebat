"use client";

import { useSession } from "@/lib/auth-client";
import { KarmaHistory } from "@/components/settings/KarmaHistory";
import { KarmaDisplay } from "@/components/shared/KarmaDisplay";

export default function KarmaPage() {
	const { data: session } = useSession();
	const userKarma =
		(session?.user as { karmaPoints?: number })?.karmaPoints || 0;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Karma</h1>
				<p className="text-muted-foreground">
					Track your karma points and see your contribution history.
				</p>
			</div>

			<div className="grid gap-6">
				<div className="flex items-center justify-between p-4 border rounded-lg">
					<div>
						<h2 className="text-lg font-semibold">Current Karma</h2>
						<p className="text-sm text-muted-foreground">
							Your total karma points earned through contributions
						</p>
					</div>
					<KarmaDisplay karma={userKarma} />
				</div>

				<KarmaHistory />
			</div>
		</div>
	);
}
