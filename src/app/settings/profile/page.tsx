import { ProfileForm } from "@/components/settings";
import { KarmaDisplay } from "@/components/shared/KarmaDisplay";
import { Separator } from "@/components/ui/separator";

export default function SettingsProfilePage() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Profile</h3>
				<p className="text-sm text-muted-foreground">
					This is how others will see you on the site.
				</p>
			</div>
			<Separator />

			<div className="flex items-center justify-between p-4 border rounded-lg">
				<div>
					<h4 className="text-sm font-medium">Your Karma</h4>
					<p className="text-xs text-muted-foreground">
						Points earned through contributions
					</p>
				</div>
				<KarmaDisplay karma={0} />
			</div>

			<ProfileForm />
		</div>
	);
}
