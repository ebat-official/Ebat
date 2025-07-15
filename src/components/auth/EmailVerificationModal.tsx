import mailIcon from "@/assets/img/emailIcon.webp";
import ButtonDark from "@/components/shared/ButtonDark";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import React, { FC, useState } from "react";

interface EmailVerificationModalProps {
	open: boolean;
	dialogHandler: () => void;
	email: string;
}

const EmailVerificationModal: FC<EmailVerificationModalProps> = ({
	open,
	dialogHandler,
	email,
}) => {
	const [loading, setLoading] = useState(false);
	const resendBtnHandler = async () => {
		try {
			setLoading(true);
			const result = await authClient.sendVerificationEmail({
				email: email,
			});

			if (result.error) {
				console.error("Failed to send verification email:", result.error);
			}

			setLoading(false);
			dialogHandler();
		} catch (error) {
			console.error("Verification email error:", error);
			setLoading(false);
		}
	};
	return (
		<Dialog open={open} onOpenChange={dialogHandler}>
			<DialogContent>
				<DialogHeader>
					<Image src={mailIcon} alt="Mail icon" />
					<DialogTitle className="text-2xl text-center">
						Verify your email address
					</DialogTitle>
					<DialogDescription className="text-center">
						A verification email has been sent to your email{" "}
						<span className="text__gradient_primary font-semibold ">
							{email}.
						</span>{" "}
						Please check your email and click the link provided in the email to
						complete your account registration.
					</DialogDescription>
				</DialogHeader>

				<p className="mt-2 text-xs text-center opacity-50">
					If you do not receive the email within the next 5 minutes, use the
					button below to resend verification email.
				</p>
				<DialogFooter>
					<ButtonDark
						onClick={resendBtnHandler}
						title="Resend Verification Email"
						loading={loading}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EmailVerificationModal;
