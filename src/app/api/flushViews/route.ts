import { incrementPostView } from "@/actions/postViews";
import { flushViewsToDB } from "@/lib/viewTracker";
import { serve } from "@upstash/workflow/nextjs";

export const { POST } = serve(async (context) => {
	await context.run("flush-inmemory-views", async () => {
		await flushViewsToDB(incrementPostView);
	});
});
