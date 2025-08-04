"use client";

import verificationBackground from "@/assets/img/verificationBackground.avif";
import verificationIcon from "@/assets/img/verificationIcon.webp";
import FormError from "@/components/shared/FormError";
import FormSuccess from "@/components/shared/FormSuccess";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
	FC,
	useEffect,
	useRef,
	useState,
	Suspense,
	startTransition,
} from "react";
import { useProgress } from "react-transition-progress";
import { MoonLoader } from "react-spinners";
import { SUCCESS } from "@/utils/constants";
import Link from "next/link";

const UserVerification: FC = () => {
	const [verificationStatus, setVerificationStatus] = useState<{
		status: "loading" | "success" | "error";
		message: string;
	}>({
		status: "loading",
		message: "",
	});
	const [timer, setTimer] = useState(3);
	const intrvl = useRef<NodeJS.Timeout | null>(null);
	const router = useRouter();
	const startProgress = useProgress();
	const searchParams = useSearchParams();
	const error = searchParams.get("error");

	useEffect(() => {
		// Check if there's an error parameter from better-auth
		if (error) {
			setVerificationStatus({
				status: "error",
				message: decodeURIComponent(error),
			});
		} else {
			// If no error, assume verification was successful
			// Better-auth handles the verification automatically when the URL is accessed
			setVerificationStatus({
				status: "success",
				message: "Email verified successfully! Redirecting...",
			});
			// Redirect immediately since autoSignInAfterVerification is enabled
			setTimeout(() => {
				startTransition(async () => {
					startProgress();
					router.push("/");
				});
			}, 1000);
		}
	}, [error, router]);

	useEffect(() => {
		if (verificationStatus.status !== "loading") {
			intrvl.current = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
		}
		return () => {
			if (intrvl.current) clearInterval(intrvl.current);
		};
	}, [verificationStatus]);

	if (timer === 0) {
		if (intrvl.current) clearInterval(intrvl.current);
		startTransition(async () => {
			startProgress();
			router.push("/");
		});
	}

	return (
		<div className="flex justify-center items-center w-screen h-screen backdrop-blur-3xl">
			<Card className="min-w-[20rem] relative z-10 flex flex-col justify-center items-center px-12 lg:px-16 mx-2">
				<CardHeader>
					<div className="flex items-center justify-center">
						<Image
							className="w-20 h-20"
							src={verificationIcon}
							alt="verification-icon"
						/>
						<CardTitle className="section__subtitle">Authentication</CardTitle>
					</div>
					<CardDescription className="text-center -mt-4">
						{verificationStatus.status === "loading" &&
							"Processing verification..."}
						{verificationStatus.status === "success" &&
							"Verification completed"}
						{verificationStatus.status === "error" && "Verification failed"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{verificationStatus.status === "loading" && (
						<MoonLoader className="text-blue-500" />
					)}
					{verificationStatus.status === "error" && (
						<FormError message={verificationStatus.message} />
					)}
					{verificationStatus.status === SUCCESS && (
						<div className="text-center">
							<h2 className="text-2xl font-bold text-green-600 mb-4">
								Email Verified Successfully!
							</h2>
							<p className="text-gray-600 mb-6">
								Your email has been verified. You can now access all features of
								the platform.
							</p>
							<Link
								href="/"
								className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
							>
								Go to Home
							</Link>
						</div>
					)}
				</CardContent>
				<CardFooter className="grid items-center">
					{verificationStatus.status !== "loading" && (
						<p className="text-sm text-slate-400 text-center">
							You will be redirected to login in {timer} seconds
						</p>
					)}
					<Button
						variant="link"
						onClick={() => {
							startTransition(async () => {
								startProgress();
								router.push("/");
							});
						}}
					>
						Back to login
					</Button>
				</CardFooter>
			</Card>
			<Image
				className="opacity-70 object-cover"
				fill={true}
				src={verificationBackground}
				alt="background"
			/>
		</div>
	);
};

export default function UserVerificationPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<UserVerification />
		</Suspense>
	);
}
