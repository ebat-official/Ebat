"use client";
import React, { FC, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import ButtonDark from "@/components/shared/ButtonDark";
import * as z from "zod";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
// import usePasswordForgot from "@/hooks/usePasswordForgot";
import { ERROR, LOADING, RESET_PASSWORD, SUCCESS } from "@/utils/contants";
import { upsertResetToken } from "@/actions/auth";
import mailer from "@/lib/mailer";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import FormError from "@/components/shared/FormError";

interface ForgotPasswordProps {
	open: boolean;
	dialogHandler: () => void;
	email?: string;
}

type FormValues = {
	email: string;
};

const schema = z.object({
	email: z.string().email(),
});

const resolver: Resolver<FormValues> = zodResolver(schema);

const ForgotPassword: FC<ForgotPasswordProps> = ({
	open,
	dialogHandler,
	email,
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({ resolver });
	const [formStatus, setFormStatus] = useState<{ status: string; data: any }>({
		status: "",
		data: "",
	});

	const onSubmit = handleSubmit(async (data) => {
		setFormStatus({ status: LOADING, data: "" });
		const verification = await upsertResetToken(data.email);
		if (verification.status === ERROR) {
			setFormStatus(verification);
			return;
		}
		mailer(data.email, RESET_PASSWORD, verification.data?.token);
		setFormStatus({ status: SUCCESS, data: "" });
	});

	return (
		<Dialog open={open} onOpenChange={dialogHandler}>
			<DialogContent>
				{formStatus.status !== SUCCESS && (
					<form onSubmit={onSubmit} noValidate>
						<DialogHeader>
							<DialogTitle className="text-2xl text-center">
								Reset password
							</DialogTitle>
							<DialogDescription className="text-center">
								You will receive an e-mail in maximum 60 seconds
							</DialogDescription>
						</DialogHeader>
						<div className="my-4">
							<input
								{...register("email")}
								type="email"
								className={cn(
									"text-sm focus:shadow-soft-primary-outline leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-fuchsia-300 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow",
									{ "border-red-500": errors?.email },
								)}
								placeholder="Email"
								aria-label="Email"
								defaultValue={email || ""}
							/>
							{errors?.email && (
								<p className="text-sm text-red-500 dark:text-red-900">
									{errors.email.message}
								</p>
							)}
						</div>
						{formStatus.status === ERROR && (
							<FormError message={formStatus.data} />
						)}
						<DialogFooter>
							<ButtonDark
								title="Send"
								loading={formStatus.status === LOADING}
							/>
						</DialogFooter>
						<p className="mt-2 text-xs text-center opacity-30">
							Please check your inbox/spam folder for the email.
						</p>
					</form>
				)}
				{formStatus.status === SUCCESS && (
					<DialogHeader className="flex items-center">
						<CheckCircledIcon className="w-16 h-16 text-green-500" />
						<DialogTitle className="text-2xl text-center">
							Request submitted successfully
						</DialogTitle>
						<DialogDescription className="text-center pt-4">
							Please take a moment to access your email, where you'll find
							detailed instructions on how to reset your password securely.
						</DialogDescription>
					</DialogHeader>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default ForgotPassword;
