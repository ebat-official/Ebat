"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import LoginModal from "@/components/auth/LoginModal";

export default function LoginPage() {
	return (
		<Suspense>
			<LoginPageInner />
		</Suspense>
	);
}

function LoginPageInner() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: session, isPending } = useSession();

	const redirectTo = searchParams.get("redirectTo") || "/";
	const message = searchParams.get("message") || "Please sign in to continue.";

	// If user is already authenticated, redirect them to their intended destination
	useEffect(() => {
		if (!isPending && session) {
			router.replace(redirectTo);
		}
	}, [session, isPending, router, redirectTo]);

	// If still loading, show nothing
	if (isPending) {
		return null;
	}

	// If not authenticated, show login modal
	if (!session) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<LoginModal
					isOpen={true}
					message={message}
					closeHandler={() => {
						// If user closes modal without logging in, redirect to home
						router.replace("/");
					}}
				/>
			</div>
		);
	}

	return null;
}
