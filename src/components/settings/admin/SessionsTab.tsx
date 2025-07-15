"use client";

import { useState } from "react";
import type { Session, SortOrder } from "../types";
import { AdminSessionsTable } from "./AdminSessionsTable";
import { useSessionActions } from "./useSessionActions";

interface SessionsTabProps {
	sessions: Session[];
}

export function SessionsTab({ sessions }: SessionsTabProps) {
	const { revokeSession, revokeAllUserSessions } = useSessionActions();
	const [sortField, setSortField] = useState<keyof Session>("createdAt");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

	const handleRevokeSession = async (sessionToken: string) => {
		await revokeSession(sessionToken);
		// Parent component should handle refreshing the sessions
	};

	const handleRevokeAllSessions = async (userId: string) => {
		await revokeAllUserSessions(userId);
		// Parent component should handle refreshing the sessions
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">Sessions Management</h2>
			</div>

			<AdminSessionsTable
				sessions={sessions}
				loading={false}
				sessionSortField={sortField}
				sessionSortOrder={sortOrder}
				setSessionSortField={setSortField}
				setSessionSortOrder={setSortOrder}
				onRevokeSession={handleRevokeSession}
				onRevokeAllSessions={handleRevokeAllSessions}
			/>
		</div>
	);
}
