"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, MoreHorizontal, Trash2 } from "lucide-react";
import type { Session, SortOrder } from "../types";

interface AdminSessionsTableProps {
	sessions: Session[];
	loading: boolean;
	sessionSortField: keyof Session;
	sessionSortOrder: SortOrder;
	setSessionSortField: (field: keyof Session) => void;
	setSessionSortOrder: (order: SortOrder) => void;
	onRevokeSession: (sessionToken: string) => void;
	onRevokeAllSessions: (userId: string) => void;
}

function formatDate(date: Date | undefined) {
	if (!date) {
		return "";
	}

	return date.toLocaleDateString("en-US", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function SortIcon({ order }: { order: "asc" | "desc" }) {
	return order === "asc" ? (
		<ChevronUp className="ml-2 h-4 w-4" />
	) : (
		<ChevronDown className="ml-2 h-4 w-4" />
	);
}

export function AdminSessionsTable({
	sessions,
	loading,
	sessionSortField,
	sessionSortOrder,
	setSessionSortField,
	setSessionSortOrder,
	onRevokeSession,
	onRevokeAllSessions,
}: AdminSessionsTableProps) {
	const handleSort = (field: keyof Session) => {
		if (sessionSortField === field) {
			setSessionSortOrder(sessionSortOrder === "asc" ? "desc" : "asc");
		} else {
			setSessionSortField(field);
			setSessionSortOrder("asc");
		}
	};

	const isExpired = (expiresAt: Date) => {
		return new Date() > expiresAt;
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">User Sessions</h2>
				{sessions.length > 0 && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							const userId = sessions[0]?.userId;
							if (userId) {
								onRevokeAllSessions(userId);
							}
						}}
					>
						Revoke All Sessions
					</Button>
				)}
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Session ID</TableHead>
							<TableHead>
								<Button
									variant="ghost"
									onClick={() => handleSort("createdAt")}
									className="h-auto p-0 font-normal"
								>
									Created
									{sessionSortField === "createdAt" && (
										<SortIcon order={sessionSortOrder} />
									)}
								</Button>
							</TableHead>
							<TableHead>
								<Button
									variant="ghost"
									onClick={() => handleSort("expiresAt")}
									className="h-auto p-0 font-normal"
								>
									Expires
									{sessionSortField === "expiresAt" && (
										<SortIcon order={sessionSortOrder} />
									)}
								</Button>
							</TableHead>
							<TableHead>IP Address</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center">
									Loading sessions...
								</TableCell>
							</TableRow>
						) : sessions.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center">
									No sessions found.
								</TableCell>
							</TableRow>
						) : (
							sessions.map((session) => (
								<TableRow key={session.id}>
									<TableCell>
										<div className="font-mono text-sm">
											{session.token.substring(0, 20)}...
										</div>
									</TableCell>
									<TableCell>{formatDate(session.createdAt)}</TableCell>
									<TableCell>{formatDate(session.expiresAt)}</TableCell>
									<TableCell>{session.ipAddress || "Unknown"}</TableCell>
									<TableCell>
										{isExpired(session.expiresAt) ? (
											<Badge variant="destructive">Expired</Badge>
										) : (
											<Badge variant="default">Active</Badge>
										)}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => onRevokeSession(session.token)}
													className="text-destructive"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Revoke Session
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
