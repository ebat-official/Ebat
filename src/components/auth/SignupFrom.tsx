"use client";
import React, { FC, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import ButtonDark from "@/components/shared/ButtonDark";
// import useRegisterUser from '@/hooks/useRegisterUser';
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import EmailVerificationModal from "./EmailVerificationModal";
import { Input } from "@/components/ui/input";
import EyeButton from "./EyeButton";
import { PASSWORD, TEXT } from "@/utils/contants";

type FormValues = {
	name: string;
	email: string;
	password: string;
};

const schema = z.object({
	name: z.string().min(2, "Name must contain at least 2 character(s)").max(25),
	email: z.string().email(),
	password: z
		.string()
		.min(8)
		.regex(/^(?=.*[!@#$%^&*])/, {
			message:
				"Password must contain at least one special character (!@#$%^&*)",
		}),
});

const resolver: Resolver<FormValues> = zodResolver(schema);

interface SignupFormProps {
	modelHandler?: (isOpen: boolean) => void;
}

const SignupForm: FC<SignupFormProps> = ({ modelHandler }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({ resolver });
	const [openEmailVerification, setOpenEmailVerification] = useState(false);
	const [userData, setUserData] = useState({ email: "" });
	// const mutation = useRegisterUser();
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = handleSubmit(async (userData) => {
		setIsLoading(true);
		setUserData(userData);

		try {
			const { data, error } = await authClient.signUp.email({
				email: userData.email,
				password: userData.password,
				name: userData.name,
			});

			setIsLoading(false);

			if (error) {
				toast({
					title: "Error",
					description: error.message,
					variant: "destructive",
				});
				return;
			}

			if (data) {
				// Successfully signed up, show email verification modal
				setOpenEmailVerification(true);
			}
		} catch (error) {
			setIsLoading(false);
			toast({
				title: "Error",
				description: "An unexpected error occurred",
				variant: "destructive",
			});
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
			<form onSubmit={onSubmit} className="text-left" noValidate>
				<div className="mb-4">
					<Input
						{...register("name")}
						type="text"
						className={cn("focus-visible:ring-0 focus-visible:outline-none", {
							"border-red-500": errors?.name,
						})}
						placeholder="Name"
						aria-label="Name"
					/>
					{errors?.name && (
						<p className="text-sm text-red-500 dark:text-red-900">
							{errors.name.message}
						</p>
					)}
				</div>
				<div className="mb-4">
					<Input
						{...register("email")}
						type="email"
						className={cn("focus-visible:ring-0 focus-visible:outline-none", {
							"border-red-500": errors?.email,
						})}
						placeholder="Email"
						aria-label="Email"
					/>
					{errors?.email && (
						<p className="text-sm text-red-500 dark:text-red-900">
							{errors.email.message}
						</p>
					)}
				</div>
				<div className="mb-4 relative">
					<Input
						{...register(PASSWORD)}
						type={showPassword ? TEXT : PASSWORD}
						className={cn("focus-visible:ring-0 focus-visible:outline-none", {
							"border-red-500": errors?.password,
						})}
						placeholder={PASSWORD}
						aria-label={PASSWORD}
					/>
					<EyeButton
						showPassword={showPassword}
						onClickHandler={showPasswordHandler}
					/>
					{errors?.password && (
						<p className="text-sm text-red-500 dark:text-red-900">
							{errors.password.message}
						</p>
					)}
				</div>
				<div className="text-center">
					<ButtonDark type="submit" title="sign up" loading={isLoading} />
				</div>
			</form>
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
export default SignupForm;
