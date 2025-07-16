import googleIcon from "@/assets/svg/googleIcon.svg";
import linkedinIcon from "@/assets/svg/linkedinIcon.svg";
import useCurrentURL from "@/hooks/useCurrentURL";
import { signIn } from "@/lib/auth-client";
import Image from "next/image";
import React, { FC } from "react";
import { FaGithub } from "react-icons/fa";
import { Button } from "../ui/button";
import { SiGithub } from "react-icons/si";

import { VscGithub } from "react-icons/vsc";
import { BsGithub } from "react-icons/bs";

interface SocialAuthProps {
	loadingHandler: (isLoading: boolean) => void;
}

const SocialAuth: FC<SocialAuthProps> = ({ loadingHandler }) => {
	const currentURL = useCurrentURL();

	const SocialLoginHandler = async (provider: string) => {
		loadingHandler(true);
		try {
			await signIn.social({
				provider,
				callbackURL: currentURL,
			});
		} catch (error) {
			console.error("Social login error:", error);
		} finally {
			loadingHandler(false);
		}
	};

	return (
		<div className="flex justify-around items-center gap-6 mt-4">
			<Button
				variant="outline"
				onClick={() => SocialLoginHandler("github")}
				className=" w-18 h-full relative"
			>
				<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
					<BsGithub className="text-gray-900 dark:text-white py-0 scale-150" />
				</div>
			</Button>

			<Button
				variant="outline"
				className="p-6"
				onClick={() => SocialLoginHandler("google")}
			>
				<Image priority src={googleIcon} alt="google signup" />
			</Button>

			<Button
				variant="outline"
				className="p-6 hover:bg-transparent hover:opacity-75"
				onClick={() => SocialLoginHandler("linkedin")}
			>
				<Image priority src={linkedinIcon} alt="google signup" />
			</Button>
		</div>
	);
};

export default SocialAuth;
