"use server";
import novuMailer from "./novuMailer";

async function mailer(to: string, type: string, token?: string) {
	try {
		await novuMailer(to, type, token);
	} catch (error) {
		console.error("Failed to send email via Novu:", error);
		// You could add a fallback email service here
		// For now, we'll just log the error
		throw new Error(
			`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export default mailer;
