"use client";
import ButtonDark from "@/components/shared/ButtonDark";
import { Input } from "@/components/ui/input";
// import useRegisterUser from '@/hooks/useRegisterUser';
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { PASSWORD, TEXT } from "@/utils/contants";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { FC, useState, useMemo } from "react";
import { Resolver, useForm } from "react-hook-form";
import * as z from "zod";
import EmailVerificationModal from "./EmailVerificationModal";
import EyeButton from "./EyeButton";
import { CheckIcon, XIcon } from "lucide-react";

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
		watch,
		formState: { errors },
	} = useForm<FormValues>({ resolver });
	const [openEmailVerification, setOpenEmailVerification] = useState(false);
	const [userData, setUserData] = useState({ email: "" });
	// const mutation = useRegisterUser();
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const [showPassword, setShowPassword] = useState(false);

	// Watch password field for real-time strength checking
	const password = watch("password") || "";

	// Password strength checking function
	const checkPasswordStrength = (pass: string) => {
		const requirements = [
			{ regex: /.{8,}/, text: "At least 8 characters" },
			{ regex: /[0-9]/, text: "At least 1 number" },
			{ regex: /[a-z]/, text: "At least 1 lowercase letter" },
			{ regex: /[A-Z]/, text: "At least 1 uppercase letter" },
			{ regex: /[!@#$%^&*]/, text: "At least 1 special character (!@#$%^&*)" },
		];

		return requirements.map((req) => ({
			met: req.regex.test(pass),
			text: req.text,
		}));
	};

	const strength = useMemo(() => checkPasswordStrength(password), [password]);

	const strengthScore = useMemo(() => {
		return strength.filter((req) => req.met).length;
	}, [strength]);

	const getStrengthColor = (score: number) => {
		if (score === 0) return "bg-border";
		if (score <= 1) return "bg-red-500";
		if (score <= 2) return "bg-orange-500";
		if (score <= 3) return "bg-amber-500";
		return "bg-emerald-500";
	};

	const getStrengthText = (score: number) => {
		if (score === 0) return "Enter a password";
		if (score <= 2) return "Weak password";
		if (score <= 3) return "Medium password";
		return "Strong password";
	};

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
				{/* Password strength indicator */}
				{password && (
					<div className="mb-4">
						{/* Password strength progress bar */}
						<div
							className="bg-border h-1 w-full overflow-hidden rounded-full"
							role="progressbar"
							aria-valuenow={strengthScore}
							aria-valuemin={0}
							aria-valuemax={5}
							aria-label="Password strength"
							tabIndex={-1}
						>
							<div
								className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
								style={{ width: `${(strengthScore / 5) * 100}%` }}
							/>
						</div>

						{/* Password strength description */}
						<p className="text-foreground mb-2 text-sm font-medium">
							{getStrengthText(strengthScore)}
						</p>

						{/* Password requirements list */}
						<ul className="space-y-1.5" aria-label="Password requirements">
							{strength.map((req, index) => (
								<li key={index} className="flex items-center gap-2">
									{req.met ? (
										<CheckIcon
											size={16}
											className="text-emerald-500"
											aria-hidden="true"
										/>
									) : (
										<XIcon
											size={16}
											className="text-muted-foreground/80"
											aria-hidden="true"
										/>
									)}
									<span
										className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
									>
										{req.text}
										<span className="sr-only">
											{req.met
												? " - Requirement met"
												: " - Requirement not met"}
										</span>
									</span>
								</li>
							))}
						</ul>
					</div>
				)}

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
