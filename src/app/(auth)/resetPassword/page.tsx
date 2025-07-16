"use client";

import backgroundImg from "@/assets/img/resetBackground.jpg";
import ButtonDark from "@/components/shared/ButtonDark";
import FormError from "@/components/shared/FormError";
import FormSuccess from "@/components/shared/FormSuccess";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
	ERROR,
	LOADING,
	SUCCESS,
	TOKEN,
	TOKEN_NOT_FOUND,
	VERIFICATION_SUCCESSFULL,
} from "@/utils/contants";
import { SOMETHING_WENT_WRONG_ERROR } from "@/utils/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import React, {
	FC,
	useEffect,
	useRef,
	useState,
	Suspense,
	startTransition,
} from "react";
import { Resolver, useForm } from "react-hook-form";
import * as z from "zod";
import { useProgress } from "react-transition-progress";

type FormValues = {
	password: string;
	confirmPassword: string;
};

const schema = z
	.object({
		password: z
			.string()
			.min(8)
			.regex(/^(?=.*[!@#$%^&*])/, {
				message:
					"Password must contain at least one special character (!@#$%^&*)",
			}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

const resolver: Resolver<FormValues> = zodResolver(schema);

const ResetPassword: FC = () => {
	const router = useRouter();
	const startProgress = useProgress();
	const searchParams = useSearchParams();
	const verificationToken = searchParams.get(TOKEN);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({ resolver });

	const [VerificationStatus, setVerificationStatus] = useState<{
		status: string;
		data: string;
	}>({
		status: "",
		data: "",
	});
	const [timer, setTimer] = useState(3);
	const intrvl = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (
			VerificationStatus.status === SUCCESS ||
			VerificationStatus.status === ERROR
		) {
			intrvl.current = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
		}
		return () => {
			if (intrvl.current) {
				clearInterval(intrvl.current);
			}
		};
	}, [VerificationStatus]);

	const onSubmit = handleSubmit(async (formData: { password: string }) => {
		setVerificationStatus({ status: LOADING, data: "" });
		if (!verificationToken) {
			setVerificationStatus({ status: ERROR, data: TOKEN_NOT_FOUND });
			return;
		}

		try {
			const { data, error } = await authClient.resetPassword({
				newPassword: formData.password,
				token: verificationToken,
			});

			if (error) {
				setVerificationStatus({
					status: ERROR,
					data: error.message || "Failed to reset password",
				});
				return;
			}

			setVerificationStatus({
				status: SUCCESS,
				data: VERIFICATION_SUCCESSFULL,
			});
		} catch (error) {
			console.error("Reset password error:", error);
			setVerificationStatus({
				status: ERROR,
				data: "Something went wrong. Please try again.",
			});
		}
	});

	if (timer === 0) {
		if (intrvl.current) {
			clearInterval(intrvl.current);
		}
		startTransition(async () => {
			startProgress();
			router.push("/");
		});
	}

	return (
		<div className="m-0 mt-0 font-sans text-base antialiased font-normal transition-all duration-200  ease-soft-in-out text-start leading-default text-slate-500">
			<section className="relative flex justify-center items-center p-0 overflow-hidden bg-center bg-cover min-h-[75vh] w-full">
				<div className="container z-10">
					<div className="flex flex-wrap mt-0 -mx-3 justify-center">
						<div className="relative flex flex-col min-w-0 mt-32 break-words bg-transparent border-0 shadow-none rounded-2xl bg-clip-border">
							<div className="p-6 pb-0 mb-0 bg-transparent border-b-0 rounded-t-2xl">
								<h4 className="relative z-10 font-bold text-center text-transparent md:text-2xl lg:text-3xl md:text-left bg-linear-to-tl from-blue-600 to-cyan-400 bg-clip-text">
									Reset your password
								</h4>
								<p className="mb-0 text-center md:text-left">
									Enter a new password for your account.
								</p>
							</div>
							<div className="flex-auto p-6">
								<form onSubmit={onSubmit} noValidate>
									<div className="mb-4">
										<input
											{...register("password")}
											type="password"
											className={cn(
												"text-sm focus:shadow-soft-primary-outline leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-fuchsia-300 focus:bg-white focus:text-gray-700 focus:outline-hidden focus:transition-shadow",
												{
													"border-red-500": errors?.password,
												},
											)}
											placeholder="Password"
											aria-label="Password"
										/>
										{errors?.password && (
											<p className="text-sm text-red-500 dark:text-red-900">
												{errors.password.message}
											</p>
										)}
									</div>
									<div className="mb-4">
										<input
											{...register("confirmPassword")}
											type="password"
											className={cn(
												"text-sm focus:shadow-soft-primary-outline leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-fuchsia-300 focus:bg-white focus:text-gray-700 focus:outline-hidden focus:transition-shadow",
												{
													"border-red-500": errors?.password,
												},
											)}
											placeholder=" Confirm password"
											aria-label="Password"
										/>
										{errors?.confirmPassword && (
											<p className="text-sm text-red-500 dark:text-red-900">
												{errors.confirmPassword.message}
											</p>
										)}
									</div>
									{VerificationStatus.status === SUCCESS && (
										<>
											<FormSuccess message="Password reset successful" />
											<p className="text-sm pt-4 text-slate-400 text-center">
												You will be redirected in {timer} seconds
											</p>
										</>
									)}

									{VerificationStatus.status === ERROR && (
										<>
											<FormError message={VerificationStatus.data} />
											<p className="text-sm pt-4 text-slate-400 text-center">
												You will be redirected in {timer} seconds
											</p>
										</>
									)}

									<div className="text-center">
										<ButtonDark
											disabled={
												VerificationStatus.status === SUCCESS ||
												VerificationStatus.status === ERROR
											}
											type="submit"
											title="Reset Password"
											loading={VerificationStatus.status === LOADING}
										/>
									</div>
								</form>
							</div>
						</div>
						<div className="w-full max-w-full px-3 lg:grow-0 lg:shrink-0  shrink-0 md:w-6/12">
							<div className="absolute top-0 hidden w-3/5 h-full -mr-32 overflow-hidden -skew-x-12 -right-40 rounded-bl-xl md:block">
								<div
									className="absolute inset-x-0 top-0 z-0 h-full -ml-16 bg-cover "
									style={{
										backgroundImage: `url(${backgroundImg.src})`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ResetPassword />
		</Suspense>
	);
}
