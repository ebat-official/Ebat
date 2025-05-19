import { serve } from "@upstash/workflow/nextjs";
import { flushViewsToDB } from "@/lib/viewTracker";
import { incrementPostView } from "@/actions/postViews";

export const { POST } = serve(async (context) => {
	await context.run("flush-inmemory-views", async () => {
		await flushViewsToDB(incrementPostView);
	});
});
