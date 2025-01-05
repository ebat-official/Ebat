"use server";
import novuMailer from "./novuMailer";

async function mailer(to: string, type: string, token?: string) {
  novuMailer(to, type, token);
}

export default mailer;
