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

type LoginModalProps = {};

const LoginModal: FC<LoginModalProps> = ({}) => {
	const [isLoginForm, setIsLoginForm] = useState<boolean>(true);
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					onClick={() => setOpen(true)}
					variant={"outline"}
					className="w-full ml-2 font-medium whitespace-nowrap"
				>
					Login
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[425px] p-8 border rounded-xl sm:rounded-3xl">
				<DialogHeader>
					<DialogTitle className="text-center">Welcome Back !</DialogTitle>
				</DialogHeader>
				<SocialAuth />
				{isLoginForm ? (
					<SigninForm modelHandler={setOpen} />
				) : (
					<SignupForm modelHandler={setOpen} />
				)}
				<DialogFooter>
					{isLoginForm && (
						<div className="flex-auto ">
							<div className="relative w-full max-w-full px-3 mt-2 text-center shrink-0">
								<hr className=" flex-shrink-0 border-t border-r border-l border-transparent h-0.5 my-6 border-b-0 opacity-25 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />

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
			</DialogContent>
		</Dialog>
	);
};

export default LoginModal;
