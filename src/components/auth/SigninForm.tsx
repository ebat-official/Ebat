"use client";
import React, { FC, useEffect, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import ButtonBlue from "@/components/shared/ButtonBlue";
// import useLoginUser from '@/hooks/useLoginUser';
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import {
	EMAIL_NOT_VERIFIED,
	EMAIL_VALIDATION,
	EMAIL_VERIFICATION,
	ERROR,
	LOADING,
	PASSWORD,
	SUCCESS,
	TEXT,
} from "@/utils/contants";
import ForgotPassword from "./ForgotPassword";
import { logIn, upsertVerificationToken } from "@/actions/auth";
import EmailVerificationModal from "./EmailVerificationModal";
import { useServerAction } from "@/hooks/useServerAction";
import mailer from "@/lib/mailer";
import { Input } from "@/components/ui/input";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import parseRedirectError from "@/utils/parseRedirectError";
import { Eye, EyeOff } from "lucide-react";
import EyeButton from "./EyeButton";
import Link from "next/link";

type FormValues = {
	email: string;
	password: string;
};

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(1, "Please enter your password"),
});

const resolver: Resolver<FormValues> = zodResolver(schema);

interface SigninFormProps {
	modelHandler?: (value: boolean) => void;
}

const SigninForm: FC<SigninFormProps> = ({ modelHandler }) => {
	const [openResetDialog, setOpenResetDialog] = useState(false);
	const [openEmailVerification, setOpenEmailVerification] = useState(false);
	const [userData, setUserData] = useState({ email: "" });
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({ resolver });
	// const mutation = useLoginUser();
	const searchParams = useSearchParams();
	const verificationEmail = searchParams.get(EMAIL_VERIFICATION);
	const [runActionSignin, isLoading] = useServerAction(logIn);
	const [formStatus, setFormStatus] = useState({ type: LOADING, data: "" });
	const { toast } = useToast();
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		if (verificationEmail) {
			setOpenEmailVerification(true);
			setUserData({ email: verificationEmail });
		}
	}, []);

	useEffect(() => {
		(async () => {
			if (openEmailVerification && userData.email) {
				const verification = await upsertVerificationToken(userData.email);
				if (verification.status === ERROR) {
					return toast({
						title: ERROR,
						description: String(verification.data),
						variant: "destructive",
					});
				}
				mailer(userData.email, EMAIL_VALIDATION, verification.data?.token);
			}
		})();
	}, [openEmailVerification]);

	const onSubmit = handleSubmit(async (userData) => {
		try {
			setUserData(userData);
			const result = await runActionSignin(userData);

			if (result?.status === SUCCESS) {
				if (modelHandler) modelHandler(false);
				return;
			}
			if (result?.status === ERROR) {
				if (result.cause === EMAIL_NOT_VERIFIED) {
					setOpenEmailVerification(true);
					await upsertVerificationToken(userData.email);
					return;
				}
				return toast({
					title: ERROR,
					// @ts-ignore
					description: result?.data?.message || JSON.stringify(result),
					variant: "destructive",
				});
			}
		} catch (error) {
			if (isRedirectError(error)) {
				const redirectInfo = parseRedirectError(error);
				if (redirectInfo?.url) window.location.href = redirectInfo.url;
			}
		}
	});

	const emailVerificationCloseHanlder = () => {
		if (modelHandler) modelHandler(false);
		setOpenEmailVerification((prev) => !prev);
	};
	const showPasswordHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setShowPassword((prev) => !prev);
	};

	return (
		<>
			<form
				onSubmit={onSubmit}
				className="text-left flex  flex-col gap-4"
				noValidate
			>
				<div className="mb-4">
					<Input
						{...register("email")}
						type="email"
						className={cn("focus-visible:ring-0 focus-visible:outline-none", {
							"border-red-500": errors?.email,
						})}
						placeholder="Email"
						aria-label="Email"
						autoComplete="username"
						name="email"
					/>
					{errors?.email && (
						<p className="text-sm text-red-500 dark:text-red-900">
							{errors.email.message}
						</p>
					)}
				</div>
				<div className="mb-4 ">
					<div className="relative">
						<Input
							{...register(PASSWORD)}
							type={showPassword ? TEXT : PASSWORD}
							name={PASSWORD}
							className={cn("focus-visible:ring-0 focus-visible:outline-none", {
								"border-red-500": errors?.password,
							})}
							placeholder={PASSWORD}
							aria-label={PASSWORD}
							autoComplete="current-password"
						/>
						<EyeButton
							showPassword={showPassword}
							onClickHandler={showPasswordHandler}
						/>
					</div>

					{errors?.password && (
						<p className="text-sm text-red-500 dark:text-red-900">
							{errors.password.message}
						</p>
					)}
				</div>
				<div className="flex justify-end w-full text-xs text-slate-500 dark:text-white -mt-6 ">
					<button
						aria-label="forgot password"
						type="button"
						onClick={(e) => {
							e.preventDefault();
							setOpenResetDialog(true);
						}}
					>
						Forgot password ?
					</button>
				</div>

				<div className="text-center ">
					<ButtonBlue
						type="submit"
						title="sign in"
						loading={isLoading}
						className="w-full"
					/>
				</div>
			</form>
			{openResetDialog && (
				<ForgotPassword
					open={openResetDialog}
					dialogHandler={() => setOpenResetDialog((prev) => !prev)}
					email={userData?.email}
				/>
			)}
			{openEmailVerification && (
				<EmailVerificationModal
					open={openEmailVerification}
					dialogHandler={emailVerificationCloseHanlder}
					email={userData?.email || ""}
				/>
			)}
		</>
	);
};
export default SigninForm;
