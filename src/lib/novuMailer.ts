import { EMAIL_VALIDATION, RESET_PASSWORD } from "@/utils/contants";
import { Novu } from "@novu/api";

async function novuMailer(toEmail: string, type: string, token?: string) {
	let redirectLink = process.env.ENV_URL;
	const novu = new Novu({ secretKey: process.env.NOVU_API_KEY });
	const nameFromEmail = toEmail.split("@")[0];
	await novu.subscribers.upsert(
		{
			email: toEmail,
			firstName: nameFromEmail,
		},
		toEmail,
	);
	switch (type) {
		case EMAIL_VALIDATION:
			redirectLink = `${process.env.ENV_URL}/api/auth/verify?token=${token}`;
			novu.trigger({
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
			redirectLink = `${process.env.ENV_URL}/resetPassword?token=${token}`;
			novu.trigger({
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
}

export default novuMailer;
