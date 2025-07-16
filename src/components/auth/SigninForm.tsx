"use client";
import ButtonBlue from "@/components/shared/ButtonBlue";
import { Input } from "@/components/ui/input";
// import useLoginUser from '@/hooks/useLoginUser';
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
// Note: useSearchParams removed - no longer needed for email verification
import { ERROR, LOADING, PASSWORD, SUCCESS, TEXT } from "@/utils/contants";
import parseRedirectError from "@/utils/parseRedirectError";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Link } from "react-transition-progress/next";
import React, { FC, useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import * as z from "zod";
import EmailVerificationModal from "./EmailVerificationModal";
import EyeButton from "./EyeButton";
import ForgotPassword from "./ForgotPassword";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { FaGoogle } from "react-icons/fa";
import { IoLogoGithub } from "react-icons/io";
import ButtonDark from "@/components/shared/ButtonDark";

type FormValues = {
	identifier: string;
	password: string;
};

// Helper function to check if input is an email
const isEmail = (value: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(value);
};

const schema = z.object({
	identifier: z.string().min(1, "Please enter your email or username"),
	password: z.string().min(1, "Please enter your password"),
});

const resolver: Resolver<FormValues> = zodResolver(schema);

interface SigninFormProps {
	modelHandler?: (value: boolean) => void;
}

const SigninForm: FC<SigninFormProps> = ({ modelHandler }) => {
	const [openResetDialog, setOpenResetDialog] = useState(false);
	const [openEmailVerification, setOpenEmailVerification] = useState(false);
	const [userData, setUserData] = useState({ identifier: "" });
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({ resolver });
	const [isLoading, setIsLoading] = useState(false);
	const [formStatus, setFormStatus] = useState({ type: LOADING, data: "" });
	const { toast } = useToast();
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = handleSubmit(async (userData) => {
		setIsLoading(true);
		try {
			setUserData(userData);

			// Determine if the identifier is an email or username
			const isEmailInput = isEmail(userData.identifier);

			if (isEmailInput) {
				// Use email sign in
				await authClient.signIn.email(
					{
						email: userData.identifier,
						password: userData.password,
					},
					{
						onError: (ctx) => {
							setIsLoading(false);
							if (ctx.error.status === 403) {
								setOpenEmailVerification(true);
							} else {
								toast({
									title: ERROR,
									description: ctx.error.message,
									variant: "destructive",
								});
							}
						},
						onSuccess: () => {
							setIsLoading(false);
							if (modelHandler) modelHandler(false);
							toast({
								title: SUCCESS,
								description: "Login successful",
								variant: "default",
							});
						},
					},
				);
			} else {
				// Use username sign in
				await authClient.signIn.username(
					{
						username: userData.identifier,
						password: userData.password,
					},
					{
						onError: (ctx) => {
							setIsLoading(false);
							toast({
								title: ERROR,
								description: ctx.error.message,
								variant: "destructive",
							});
						},
						onSuccess: () => {
							setIsLoading(false);
							if (modelHandler) modelHandler(false);
							toast({
								title: SUCCESS,
								description: "Login successful",
								variant: "default",
							});
						},
					},
				);
			}
		} catch (error) {
			setIsLoading(false);
			if (isRedirectError(error)) {
				const redirectInfo = parseRedirectError(error);
				if (redirectInfo?.url) window.location.href = redirectInfo.url;
			}
		}
	});
	const showPasswordHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setShowPassword((prev) => !prev);
	};

	const emailVerificationCloseHandler = () => {
		if (modelHandler) modelHandler(false);
		setOpenEmailVerification((prev) => !prev);
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
						{...register("identifier")}
						type="text"
						className={cn("focus-visible:ring-0 focus-visible:outline-none", {
							"border-red-500": errors?.identifier,
						})}
						placeholder="Email or Username"
						aria-label="Email or Username"
						autoComplete="username"
						name="identifier"
					/>
					{errors?.identifier && (
						<p className="text-sm text-red-500 dark:text-red-900">
							{errors.identifier.message}
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
					email={userData?.identifier}
				/>
			)}
			{openEmailVerification && (
				<EmailVerificationModal
					open={openEmailVerification}
					dialogHandler={emailVerificationCloseHandler}
					email={userData?.identifier || ""}
				/>
			)}
		</>
	);
};
export default SigninForm;
