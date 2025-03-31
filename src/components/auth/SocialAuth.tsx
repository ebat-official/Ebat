import React, { FC } from "react";
import Image from "next/image";
import googleIcon from "@/assets/svg/googleIcon.svg";
import facebookIcon from "@/assets/svg/facebookIcon.svg";
import linkedinIcon from "@/assets/svg/linkedinIcon.svg";
import { signIn } from "next-auth/react";
import useCurrentURL from "@/hooks/useCurrentURL";
import { Button } from "../ui/button";

interface SocialAuthProps {
	loadingHandler: (isLoading: boolean) => void;
}

const SocialAuth: FC<SocialAuthProps> = ({ loadingHandler }) => {
	const currentURL = useCurrentURL();
	function SocialLoginHandler(provider: string) {
		loadingHandler(true);
		signIn(provider, {
			callbackUrl: currentURL,
		});
	}
	return (
		<div className="flex justify-around items-center gap-6 mt-4">
			<Button
				onClick={() => SocialLoginHandler("facebook")}
				className="flex outline-0 relative items-center justify-center px-6 py-6  text-xs font-bold text-center text-gray-200 uppercase align-middle transition-all bg-transparent border border-gray-200 border-solid rounded-lg shadow-none cursor-pointer hover:scale-102 leading-pro ease-soft-in tracking-tight-soft bg-150 bg-x-25 hover:bg-transparent hover:opacity-75"
			>
				<Image priority src={facebookIcon} alt="facebook signup" />
			</Button>

			<Button
				variant="outline"
				onClick={() => SocialLoginHandler("google")}
				className="flex relative items-center justify-center  px-6 py-6 text-xs font-bold text-center text-gray-200 uppercase align-middle transition-all bg-transparent border border-gray-200 border-solid rounded-lg shadow-none cursor-pointer hover:scale-102 leading-pro ease-soft-in tracking-tight-soft bg-150 bg-x-25 hover:bg-transparent hover:opacity-75"
			>
				<Image priority src={googleIcon} alt="google signup" />
			</Button>

			<Button
				variant="outline"
				className="flex relative items-center justify-center  px-6 py-6 text-xs font-bold text-center text-gray-200 uppercase align-middle transition-all bg-transparent border border-gray-200 border-solid rounded-lg shadow-none cursor-pointer hover:scale-102 leading-pro ease-soft-in tracking-tight-soft bg-150 bg-x-25 hover:bg-transparent hover:opacity-75"
				onClick={() => SocialLoginHandler("linkedin")}
			>
				<Image priority src={linkedinIcon} alt="google signup" />
			</Button>
		</div>
	);
};

export default SocialAuth;
