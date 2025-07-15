"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { UserRole } from "@/db/schema/enums";
import {
	AlertTriangle,
	ArrowUpDown,
	Ban,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Columns,
	Edit,
	Eye,
	EyeOff,
	MoreHorizontal,
	Search,
	Settings,
	Shield,
	Trash2,
	Unlock,
	UserPlus,
	Users,
	XCircle,
} from "lucide-react";
import { categoryColumns, columnConfig, defaultColumns } from "../constants";
import type { User } from "../types";

interface AdminUserTableProps {
	users: User[];
	loading: boolean;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	onBanUser: (userId: string) => void;
	onUnbanUser: (userId: string) => void;
	onSetRole: (userId: string, role: UserRole) => void;
	onDeleteUser: (userId: string) => void;
	onImpersonateUser: (userId: string) => void;
	onLoadSessions: (userId: string) => void;
	onShowBanDetails?: (user: User) => void;
	userSortField: keyof User;
	userSortOrder: "asc" | "desc";
	setUserSortField: (field: keyof User) => void;
	setUserSortOrder: (order: "asc" | "desc") => void;
}

function formatDate(date: Date | undefined) {
	if (!date) {
		return "";
	}

	return date.toLocaleDateString("en-US", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

function SortIcon({ order }: { order: "asc" | "desc" }) {
	return order === "asc" ? (
		<ChevronUp className="ml-2 h-4 w-4" />
	) : (
		<ChevronDown className="ml-2 h-4 w-4" />
	);
}

export function AdminUserTable({
	users,
	loading,
	searchQuery,
	setSearchQuery,
	onBanUser,
	onUnbanUser,
	onSetRole,
	onDeleteUser,
	onImpersonateUser,
	onLoadSessions,
	onShowBanDetails,
	userSortField,
	userSortOrder,
	setUserSortField,
	setUserSortOrder,
}: AdminUserTableProps) {
	const [selectedColumns, setSelectedColumns] =
		useState<string[]>(defaultColumns);

	// Debug logging
	console.log("AdminUserTable received users:", users);
	if (users.length > 0) {
		console.log("First user in table:", users[0]);
	}

	const handleSort = (field: keyof User) => {
		if (userSortField === field) {
			setUserSortOrder(userSortOrder === "asc" ? "desc" : "asc");
		} else {
			setUserSortField(field);
			setUserSortOrder("asc");
		}
	};

	const handleColumnToggle = (columnId: string) => {
		setSelectedColumns((prev) =>
			prev.includes(columnId)
				? prev.filter((id) => id !== columnId)
				: [...prev, columnId],
		);
	};

	const renderCell = (user: User, columnId: string) => {
		switch (columnId) {
			case "user":
				return (
					<div className="flex items-center space-x-3">
						<Avatar>
							<AvatarImage src={user.image || ""} />
							<AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-medium">{user.name}</div>
							<div className="text-sm text-muted-foreground">{user.email}</div>
						</div>
					</div>
				);
			case "role":
				return (
					<Badge
						variant={user.role === UserRole.ADMIN ? "default" : "secondary"}
					>
						{user.role}
					</Badge>
				);
			case "createdAt":
				return formatDate(user.createdAt);
			case "status":
				return user.banned ? (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Badge
									variant="destructive"
									className="cursor-pointer hover:bg-red-700"
									onClick={() => onShowBanDetails?.(user)}
								>
									<Ban className="mr-1 h-3 w-3" />
									Banned
								</Badge>
							</TooltipTrigger>
							<TooltipContent>
								<p>Click to view ban details</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				) : (
					<Badge variant="default">
						<CheckCircle className="mr-1 h-3 w-3" />
						Active
					</Badge>
				);
			case "userName":
				return user.userName || "-";
			case "emailVerified":
				return (
					<Badge variant={user.emailVerified ? "default" : "secondary"}>
						{user.emailVerified ? "Verified" : "Unverified"}
					</Badge>
				);
			case "updatedAt":
				return user.updatedAt ? formatDate(user.updatedAt) : "-";
			case "accountStatus":
				return <Badge variant="outline">{user.accountStatus}</Badge>;
			case "karmaPoints":
				return user.karmaPoints || 0;
			case "coins":
				return user.coins || 0;
			case "subscriptionPlan":
				return <Badge variant="outline">{user.subscriptionPlan}</Badge>;
			case "jobTitle":
				return user.jobTitle || "-";
			case "companyName":
				return user.companyName || "-";
			case "location":
				return user.location || "-";
			case "description": {
				const desc = user.description;
				return desc ? (
					<div className="max-w-[200px] truncate" title={desc}>
						{desc}
					</div>
				) : (
					"-"
				);
			}
			default:
				return "-";
		}
	};

	const renderHeader = (columnId: string) => {
		const config = columnConfig[columnId as keyof typeof columnConfig];
		if (!config) return columnId;

		if (
			columnId === "user" ||
			columnId === "status" ||
			columnId === "actions"
		) {
			return config.label;
		}

		return (
			<Button
				variant="ghost"
				onClick={() => handleSort(columnId as keyof User)}
				className="h-auto p-0 font-normal"
			>
				{config.label}
				{userSortField === columnId && <SortIcon order={userSortOrder} />}
			</Button>
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Users className="h-5 w-5" />
					<h2 className="text-lg font-semibold">User Management</h2>
				</div>
				<div className="flex items-center space-x-2">
					<div className="relative">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search users..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8 w-64"
						/>
					</div>
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm">
								<Columns className="h-4 w-4 mr-2" />
							</Button>
						</SheetTrigger>
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Customize Table Columns</SheetTitle>
								<SheetDescription>
									Select which columns to display in the user management table.
								</SheetDescription>
							</SheetHeader>
							<div className="flex-1 py-6">
								<Accordion
									type="multiple"
									defaultValue={["basic"]}
									className="w-full p-4"
								>
									<AccordionItem value="basic">
										<AccordionTrigger className="text-sm font-semibold">
											Basic Information
										</AccordionTrigger>
										<AccordionContent className="space-y-3 pt-2">
											{categoryColumns.basic.map((columnId) => {
												const config =
													columnConfig[columnId as keyof typeof columnConfig];
												if (!config) return null;

												return (
													<div
														key={columnId}
														className="flex items-center space-x-3"
													>
														<Checkbox
															id={columnId}
															checked={selectedColumns.includes(columnId)}
															onCheckedChange={() =>
																handleColumnToggle(columnId)
															}
														/>
														<div className="flex-1">
															<label
																htmlFor={columnId}
																className="text-sm font-medium"
															>
																{config.label}
															</label>
															<p className="text-xs text-muted-foreground">
																{config.description}
															</p>
														</div>
													</div>
												);
											})}
										</AccordionContent>
									</AccordionItem>

									<AccordionItem value="profile">
										<AccordionTrigger className="text-sm font-semibold">
											Profile Information
										</AccordionTrigger>
										<AccordionContent className="space-y-3 pt-2">
											{categoryColumns.profile.map((columnId) => {
												const config =
													columnConfig[columnId as keyof typeof columnConfig];
												if (!config) return null;

												return (
													<div
														key={columnId}
														className="flex items-center space-x-3"
													>
														<Checkbox
															id={columnId}
															checked={selectedColumns.includes(columnId)}
															onCheckedChange={() =>
																handleColumnToggle(columnId)
															}
														/>
														<div className="flex-1">
															<label
																htmlFor={columnId}
																className="text-sm font-medium"
															>
																{config.label}
															</label>
															<p className="text-xs text-muted-foreground">
																{config.description}
															</p>
														</div>
													</div>
												);
											})}
										</AccordionContent>
									</AccordionItem>

									<AccordionItem value="engagement">
										<AccordionTrigger className="text-sm font-semibold">
											Engagement Metrics
										</AccordionTrigger>
										<AccordionContent className="space-y-3 pt-2">
											{categoryColumns.engagement.map((columnId) => {
												const config =
													columnConfig[columnId as keyof typeof columnConfig];
												if (!config) return null;

												return (
													<div
														key={columnId}
														className="flex items-center space-x-3"
													>
														<Checkbox
															id={columnId}
															checked={selectedColumns.includes(columnId)}
															onCheckedChange={() =>
																handleColumnToggle(columnId)
															}
														/>
														<div className="flex-1">
															<label
																htmlFor={columnId}
																className="text-sm font-medium"
															>
																{config.label}
															</label>
															<p className="text-xs text-muted-foreground">
																{config.description}
															</p>
														</div>
													</div>
												);
											})}
										</AccordionContent>
									</AccordionItem>

									<AccordionItem value="professional">
										<AccordionTrigger className="text-sm font-semibold">
											Professional Information
										</AccordionTrigger>
										<AccordionContent className="space-y-3 pt-2">
											{categoryColumns.professional.map((columnId) => {
												const config =
													columnConfig[columnId as keyof typeof columnConfig];
												if (!config) return null;

												return (
													<div
														key={columnId}
														className="flex items-center space-x-3"
													>
														<Checkbox
															id={columnId}
															checked={selectedColumns.includes(columnId)}
															onCheckedChange={() =>
																handleColumnToggle(columnId)
															}
														/>
														<div className="flex-1">
															<label
																htmlFor={columnId}
																className="text-sm font-medium"
															>
																{config.label}
															</label>
															<p className="text-xs text-muted-foreground">
																{config.description}
															</p>
														</div>
													</div>
												);
											})}
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</div>
							<SheetFooter>
								<SheetClose asChild>
									<Button variant="outline">Close</Button>
								</SheetClose>
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{selectedColumns.map((columnId) => (
								<TableHead key={columnId}>{renderHeader(columnId)}</TableHead>
							))}
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell
									colSpan={selectedColumns.length + 1}
									className="text-center"
								>
									Loading users...
								</TableCell>
							</TableRow>
						) : users.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={selectedColumns.length + 1}
									className="text-center"
								>
									No users found.
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow key={user.id}>
									{selectedColumns.map((columnId) => (
										<TableCell key={columnId}>
											{renderCell(user, columnId)}
										</TableCell>
									))}
									<TableCell className="text-right">
										<TooltipProvider>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<Tooltip>
														<TooltipTrigger asChild>
															<DropdownMenuItem
																onClick={() => onImpersonateUser(user.id)}
															>
																<Eye className="mr-2 h-4 w-4" />
																Impersonate
															</DropdownMenuItem>
														</TooltipTrigger>
														<TooltipContent>
															<p>Login as this user</p>
														</TooltipContent>
													</Tooltip>
													<DropdownMenuItem
														onClick={() => onLoadSessions(user.id)}
													>
														<Shield className="mr-2 h-4 w-4" />
														View Sessions
													</DropdownMenuItem>
													{user.banned ? (
														<DropdownMenuItem
															onClick={() => onUnbanUser(user.id)}
														>
															<Unlock className="mr-2 h-4 w-4" />
															Unban User
														</DropdownMenuItem>
													) : (
														<DropdownMenuItem
															onClick={() => onBanUser(user.id)}
														>
															<Ban className="mr-2 h-4 w-4" />
															Ban User
														</DropdownMenuItem>
													)}
													{user.role === UserRole.USER && (
														<DropdownMenuItem
															onClick={() => onSetRole(user.id, UserRole.ADMIN)}
														>
															<Shield className="mr-2 h-4 w-4" />
															Make Admin
														</DropdownMenuItem>
													)}
													{user.role === UserRole.ADMIN && (
														<DropdownMenuItem
															onClick={() => onSetRole(user.id, UserRole.USER)}
														>
															<UserPlus className="mr-2 h-4 w-4" />
															Make User
														</DropdownMenuItem>
													)}
													<DropdownMenuItem
														onClick={() => onDeleteUser(user.id)}
														className="text-destructive"
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete User
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TooltipProvider>
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
