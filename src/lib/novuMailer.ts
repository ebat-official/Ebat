import { EMAIL_VALIDATION, RESET_PASSWORD } from "@/utils/contants";
import { Novu } from "@novu/node";

const FROM_MAIL = "support@codemastero.com";

async function novuMailer(toEmail: string, type: string, token?: string) {
  let redirectLink = process.env.ENV_URL;
  const novu = new Novu(`${process.env.NOVU_API_KEY}`);
  const name = toEmail.split("@")[0];
  await novu.subscribers.identify(toEmail, {
    email: toEmail,
    firstName: name,
  });
  switch (type) {
    case EMAIL_VALIDATION:
      redirectLink = `${process.env.ENV_URL}/api/auth/verify?token=${token}`;
      novu.trigger("account-activation", {
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
      novu.trigger("password-reset", {
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
