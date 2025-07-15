"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SortOrder, User } from "../types";
import { useLoadingState } from "./useLoadingState";

interface UseUsersProps {
	pageSize?: number;
}

export function useUsers({ pageSize = 10 }: UseUsersProps = {}) {
	const [users, setUsers] = useState<User[]>([]);
	const [totalUsers, setTotalUsers] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const { loading, setLoading } = useLoadingState();
	const [searchQuery, setSearchQuery] = useState("");
	const [sortField, setSortField] = useState<keyof User>("createdAt");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

	const loadUsers = async () => {
		const offset = (currentPage - 1) * pageSize;

		await authClient.admin.listUsers(
			{
				query: {
					limit: pageSize,
					offset,
					...(searchQuery && {
						searchField: "email",
						searchOperator: "contains",
						searchValue: searchQuery,
					}),
					sortBy: "createdAt",
					sortDirection: "desc",
				},
			},
			{
				onRequest: () => {
					setLoading(true);
				},
				onSuccess: (ctx) => {
					if ("data" in ctx && ctx.data) {
						setUsers(ctx.data.users || []);
						setTotalUsers(ctx.data.total || 0);
					} else {
						setUsers([]);
						setTotalUsers(0);
					}
				},
				onError: (error) => {
					console.error("Error loading users:", error);
					toast.error("Failed to load users");
					setUsers([]);
					setTotalUsers(0);
				},
				onResponse: () => {
					setLoading(false);
				},
				timeout: 15000,
				retry: {
					type: "linear",
					attempts: 3,
					delay: 1000,
				},
			},
		);
	};

	useEffect(() => {
		loadUsers();
	}, [currentPage, searchQuery]);

	const totalPages = Math.ceil(totalUsers / pageSize);

	return {
		users,
		totalUsers,
		currentPage,
		setCurrentPage,
		loading,
		searchQuery,
		setSearchQuery,
		sortField,
		setSortField,
		sortOrder,
		setSortOrder,
		totalPages,
		loadUsers,
	};
}
