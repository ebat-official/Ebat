import { EMAIL_VALIDATION, RESET_PASSWORD } from "@/utils/contants";
import { Novu } from "@novu/api";

async function novuMailer(toEmail: string, type: string, token?: string) {
	let redirectLink = process.env.ENV_URL;
	const novu = new Novu({ secretKey: process.env.NOVU_API_KEY });
	const nameFromEmail = toEmail.split("@")[0];

	try {
		// Try to create subscriber first, if it fails, try to update
		console.log("Creating subscriber:", toEmail);
		let subscriber: unknown;
		try {
			subscriber = await novu.subscribers.create({
				subscriberId: toEmail,
				email: toEmail,
				firstName: nameFromEmail,
			});
			console.log("Subscriber created:", subscriber);
		} catch (createError: unknown) {
			const error = createError as { statusCode?: number };
			if (error.statusCode === 409) {
				// Subscriber already exists, try to update
				console.log("Subscriber exists, updating:", toEmail);
				subscriber = await novu.subscribers.upsert(
					{
						email: toEmail,
						firstName: nameFromEmail,
					},
					toEmail,
				);
				console.log("Subscriber updated:", subscriber);
			} else {
				throw createError;
			}
		}

		switch (type) {
			case EMAIL_VALIDATION:
				redirectLink = `${process.env.ENV_URL}/api/auth/verify?token=${token}`;
				console.log("Sending email verification to:", toEmail);
				await novu.trigger({
					workflowId: "account-activation",
					to: {
						subscriberId: toEmail,
						email: toEmail,
					},
					payload: {
						confirmationLink: redirectLink,
					},
				});
				console.log("Email verification sent successfully");
				break;

			case RESET_PASSWORD:
				redirectLink = `${process.env.ENV_URL}/resetPassword?token=${token}`;
				console.log("Sending password reset to:", toEmail);
				await novu.trigger({
					workflowId: "password-reset",
					to: {
						subscriberId: toEmail,
						email: toEmail,
					},
					payload: {
						resetLink: redirectLink,
					},
				});
				console.log("Password reset email sent successfully");
				break;
		}
	} catch (error) {
		console.error("Novu mailer error:", error);
		throw error;
	}
}

export default novuMailer;
