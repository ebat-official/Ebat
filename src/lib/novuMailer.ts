import { EMAIL_VALIDATION, RESET_PASSWORD } from "@/utils/contants";
import { Novu } from "@novu/api";

async function novuMailer(toEmail: string, type: string, tokenOrUrl?: string) {
	let redirectLink = process.env.ENV_URL;
	const novu = new Novu({ secretKey: process.env.NOVU_API_KEY });
	const nameFromEmail = toEmail.split("@")[0];

	try {
		// Try to create subscriber first, if it fails, try to update
		let subscriber: unknown;
		try {
			subscriber = await novu.subscribers.create({
				subscriberId: toEmail,
				email: toEmail,
				firstName: nameFromEmail,
			});
		} catch (createError: unknown) {
			const error = createError as { statusCode?: number };
			if (error.statusCode === 409) {
				// Subscriber already exists, try to update
				subscriber = await novu.subscribers.upsert(
					{
						email: toEmail,
						firstName: nameFromEmail,
					},
					toEmail,
				);
			} else {
				throw createError;
			}
		}

		switch (type) {
			case EMAIL_VALIDATION:
				// Use the URL provided by better-auth directly
				redirectLink = tokenOrUrl || `${process.env.ENV_URL}/verify`;
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
				break;

			case RESET_PASSWORD:
				// Use the URL provided by better-auth directly
				redirectLink = tokenOrUrl || `${process.env.ENV_URL}/resetPassword`;
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
				break;
		}
	} catch (error) {
		console.error("Novu mailer error:", error);
		throw error;
	}
}

export default novuMailer;
