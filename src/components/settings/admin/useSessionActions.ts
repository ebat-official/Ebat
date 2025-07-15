"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import type { Session } from "../types";
import { useMultiLoadingState } from "./useLoadingState";

export function useSessionActions() {
	const { loading, setLoading } = useMultiLoadingState();

	const loadUserSessions = async (userId: string): Promise<Session[]> => {
		let sessions: Session[] = [];

		await authClient.admin.listUserSessions(
			{
				userId,
			},
			{
				onRequest: () => {
					setLoading("loadSessions", true);
				},
				onSuccess: (ctx) => {
					if ("data" in ctx && ctx.data) {
						sessions = ctx.data.sessions || [];
					}
				},
				onError: (error) => {
					console.error("Error loading sessions:", error);
					toast.error("Failed to load user sessions");
					sessions = [];
				},
				onResponse: () => {
					setLoading("loadSessions", false);
				},
				timeout: 10000,
			},
		);

		return sessions;
	};

	const revokeSession = async (sessionToken: string) => {
		await authClient.admin.revokeUserSession(
			{
				sessionToken,
			},
			{
				onRequest: () => {
					setLoading("revokeSession", true);
				},
				onSuccess: () => {
					toast.success("Session revoked successfully");
				},
				onError: (error) => {
					console.error("Error revoking session:", error);
					toast.error("Failed to revoke session");
				},
				onResponse: () => {
					setLoading("revokeSession", false);
				},
				timeout: 10000,
			},
		);
	};

	const revokeAllUserSessions = async (userId: string) => {
		await authClient.admin.revokeUserSessions(
			{
				userId,
			},
			{
				onRequest: () => {
					setLoading("revokeAllSessions", true);
				},
				onSuccess: () => {
					toast.success("All sessions revoked successfully");
				},
				onError: (error) => {
					console.error("Error revoking all sessions:", error);
					toast.error("Failed to revoke all sessions");
				},
				onResponse: () => {
					setLoading("revokeAllSessions", false);
				},
				timeout: 10000,
			},
		);
	};

	return {
		loading,
		isAnyLoading: Object.values(loading).some(Boolean),
		loadUserSessions,
		revokeSession,
		revokeAllUserSessions,
	};
}
