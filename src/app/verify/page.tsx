"use client";

import React, { FC, useEffect, useRef, useState, Suspense } from "react";
import verificationIcon from "@/assets/img/verificationIcon.webp";
import verificationBackground from "@/assets/img/verificationBackground.avif";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoonLoader } from "react-spinners";
import FormError from "@/components/shared/FormError";
import FormSuccess from "@/components/shared/FormSuccess";
import { useRouter, useSearchParams } from "next/navigation";

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
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const error = searchParams.get("error");

	useEffect(() => {
		// Check if there's an error parameter
		if (error) {
			setVerificationStatus({
				status: "error",
				message: decodeURIComponent(error),
			});
		} else if (token) {
			// If token exists, assume verification was successful
			setVerificationStatus({
				status: "success",
				message: "Email verified successfully!",
			});
		} else {
			// No token or error, show generic error
			setVerificationStatus({
				status: "error",
				message: "Invalid verification link",
			});
		}
	}, [token, error]);

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
		router.push("/");
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
					{verificationStatus.status === "success" && (
						<FormSuccess message={verificationStatus.message} />
					)}
				</CardContent>
				<CardFooter className="grid items-center">
					{verificationStatus.status !== "loading" && (
						<p className="text-sm text-slate-400 text-center">
							You will be redirected to login in {timer} seconds
						</p>
					)}
					<Button variant="link" onClick={() => router.push("/")}>
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
