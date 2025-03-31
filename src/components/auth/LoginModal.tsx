"use client";
import React, { FC, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import SigninForm from "@/components/auth/SigninForm";
import ButtonDark from "@/components/shared/ButtonDark";
import SocialAuth from "./SocialAuth";
import SignupForm from "./SignupFrom";
import Loader from "@/components/shared/Loader/Loader";
import FormSuccess from "../shared/FormSuccess";
import FormError from "../shared/FormError";

type LoginModalProps = {
	isOpen?: boolean;
	dialogTrigger?: boolean;
	closeHandler?: () => void;
	message?: string;
};

const LoginModal: FC<LoginModalProps> = ({
	dialogTrigger = false,
	closeHandler = () => {},
	message,
}) => {
	const [isLoginForm, setIsLoginForm] = useState<boolean>(true);
	const [open, setOpen] = useState(!dialogTrigger);
	const [loading, setLoading] = useState(false);

	function onCloseHanlder() {
		setOpen(!open);
		closeHandler();
	}
	return (
		<Dialog open={open} onOpenChange={onCloseHanlder}>
			{dialogTrigger && (
				<DialogTrigger asChild>
					<Button
						onClick={() => setOpen(true)}
						variant={"outline"}
						className="px-6  ml-2 font-medium whitespace-nowrap"
					>
						Login
					</Button>
				</DialogTrigger>
			)}
			<DialogContent className="p-8 border rounded-xl sm:rounded-3xl !max-w-md">
				{loading && (
					<div className="absolute inset-0 z-50 flex items-center justify-center w-full h-full bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-50 backdrop-blur-md rounded-3xl">
						<Loader />
					</div>
				)}
				<>
					<DialogHeader className="flex flex-col items-center justify-center gap-4">
						<DialogTitle className="text-center">Welcome Back !</DialogTitle>
						{message && <FormError message={message} />}
					</DialogHeader>
					<SocialAuth loadingHandler={setLoading} />
					{isLoginForm ? (
						<SigninForm modelHandler={setOpen} />
					) : (
						<SignupForm modelHandler={setOpen} />
					)}
					<DialogFooter>
						{isLoginForm && (
							<div className="flex-auto ">
								<div className="relative w-full max-w-full px-3 mt-2 text-center shrink-0">
									<hr className=" shrink-0 border-t border-r border-l border-transparent h-0.5 my-6 border-b-0 opacity-25 bg-linear-to-r from-transparent via-slate-400 to-transparent" />

									<p className="absolute z-20 inline px-4 mb-2 text-sm font-semibold leading-normal -translate-x-1/2 -translate-y-1/2 bg-background left-1/2 top-1/2 text-slate-400">
										or
									</p>
								</div>
								<ButtonDark
									title="sign up"
									onClick={() => setIsLoginForm(false)}
								/>
							</div>
						)}
					</DialogFooter>
					{!isLoginForm && (
						<div className="flex items-center justify-start -mt-4 ">
							<p className="text-sm leading-normal justify-self-start">
								Already have an account?
							</p>
							<Button
								onClick={() => setIsLoginForm(true)}
								className="font-bold "
								variant="link"
								data-testid="login-btn"
							>
								Sign in
							</Button>
						</div>
					)}
				</>
			</DialogContent>
		</Dialog>
	);
};

export default LoginModal;
