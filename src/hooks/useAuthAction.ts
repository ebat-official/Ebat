"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import LoginModal from "@/components/auth/LoginModal";

interface UseAuthActionOptions {
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
	requireAuth?: boolean;
	authMessage?: string;
}

interface UseAuthActionReturn {
	executeAction: (action: () => Promise<void> | void) => Promise<void>;
	isAuthenticated: boolean;
	showLoginModal: boolean;
	closeLoginModal: () => void;
	loginMessage: string;
	renderLoginModal: () => React.ReactNode;
}

/**
 * Custom hook that provides authentication wrapper for any action
 * Automatically shows login modal if user is not authenticated and executes the action once they sign in.
 *
 * @example
 * ```tsx
 * const { executeAction, renderLoginModal } = useAuthAction({
 *   requireAuth: true,
 *   authMessage: "Please sign in to save your progress",
 *   onSuccess: () => toast.success("Action completed!"),
 *   onError: (error) => toast.error("Action failed"),
 * });
 *
 * const handleSave = () => {
 *   executeAction(async () => {
 *     await saveToDatabase();
 *   });
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleSave}>Save Progress</button>
 *     {renderLoginModal()}
 *   </>
 * );
 * ```
 */
export function useAuthAction(
	options: UseAuthActionOptions = {},
): UseAuthActionReturn {
	const { data: session, status } = useSession();
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [pendingAction, setPendingAction] = useState<
		(() => Promise<void> | void) | null
	>(null);

	const isAuthenticated = status === "authenticated" && !!session;
	const loginMessage = options.authMessage || "Please sign in to continue";

	const closeLoginModal = useCallback(() => {
		setShowLoginModal(false);
		setPendingAction(null);
	}, []);

	// Execute pending action when user becomes authenticated
	useEffect(() => {
		if (isAuthenticated && pendingAction) {
			const executePending = async () => {
				try {
					await pendingAction();
					options.onSuccess?.();
				} catch (error) {
					options.onError?.(error);
				} finally {
					setPendingAction(null);
				}
			};
			executePending();
		}
	}, [isAuthenticated, pendingAction, options]);

	const executeAction = useCallback(
		async (action: () => Promise<void> | void) => {
			// If authentication is not required, execute immediately
			if (!options.requireAuth) {
				try {
					await action();
					options.onSuccess?.();
				} catch (error) {
					options.onError?.(error);
				}
				return;
			}

			// If user is not authenticated, show login modal and store the action
			if (!isAuthenticated) {
				setPendingAction(() => action);
				setShowLoginModal(true);
				return;
			}

			// User is authenticated, execute the action
			try {
				await action();
				options.onSuccess?.();
			} catch (error) {
				options.onError?.(error);
			}
		},
		[isAuthenticated, options],
	);

	const renderLoginModal = useCallback(() => {
		if (!showLoginModal) return null;

		return React.createElement(LoginModal, {
			closeHandler: closeLoginModal,
			message: loginMessage,
		});
	}, [showLoginModal, closeLoginModal, loginMessage]);

	return {
		executeAction,
		isAuthenticated,
		showLoginModal,
		closeLoginModal,
		loginMessage,
		renderLoginModal,
	};
}
