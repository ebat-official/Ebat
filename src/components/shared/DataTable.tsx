"use client";

import React, { useEffect } from "react";
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
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
	ArrowUpDown,
	ChevronDown,
	ChevronUp,
	Columns,
	MoreHorizontal,
	Search,
	Filter,
} from "lucide-react";
import { TableWithScroll } from "./TableWithScroll";

export interface ColumnConfig {
	id: string;
	label: string;
	description: string;
	category: string;
	sortable?: boolean;
	filterable?: boolean;
	filterOptions?: { value: string; label: string }[];
}

export interface CategoryColumns {
	[key: string]: string[];
}

export interface DataTableProps<T> {
	data: T[];
	loading: boolean;
	columns: ColumnConfig[];
	categoryColumns: CategoryColumns;
	defaultColumns: string[];
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	sortField: string;
	sortOrder: "asc" | "desc";
	setSortField: (field: string) => void;
	setSortOrder: (order: "asc" | "desc") => void;
	renderCell: (item: T, columnId: string) => React.ReactNode;
	renderActions?: (item: T) => React.ReactNode;
	title?: string;
	emptyMessage?: string;
	loadingMessage?: string;
	searchPlaceholder?: string;
	showSearch?: boolean;
	showColumnCustomization?: boolean;
	filters?: Record<string, string>;
	setFilters?: (filters: Record<string, string>) => void;
	// Pagination props
	currentPage?: number;
	pageSize?: number;
	totalItems?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	showPagination?: boolean;
}

function SortIcon({ order }: { order: "asc" | "desc" }) {
	return order === "asc" ? (
		<ChevronUp className="ml-2 h-4 w-4" />
	) : (
		<ChevronDown className="ml-2 h-4 w-4" />
	);
}

export function DataTable<T>({
	data,
	loading,
	columns,
	categoryColumns,
	defaultColumns,
	searchQuery,
	setSearchQuery,
	sortField,
	sortOrder,
	setSortField,
	setSortOrder,
	renderCell,
	renderActions,
	title,
	emptyMessage = "No data found.",
	loadingMessage = "Loading...",
	searchPlaceholder = "Search...",
	showSearch = true,
	showColumnCustomization = true,
	filters = {},
	setFilters,
	// Pagination props
	currentPage = 1,
	pageSize = 10,
	totalItems = 0,
	totalPages = 1,
	onPageChange,
	showPagination = false,
}: DataTableProps<T>) {
	const [selectedColumns, setSelectedColumns] =
		useState<string[]>(defaultColumns);

	// Update selectedColumns when defaultColumns changes
	useEffect(() => {
		setSelectedColumns(defaultColumns);
	}, [defaultColumns]);

	const handleSort = (field: string) => {
		if (setSortField) {
			if (sortField === field) {
				setSortOrder(sortOrder === "asc" ? "desc" : "asc");
			} else {
				setSortField(field);
				setSortOrder("asc");
			}
		}
	};

	const handleColumnToggle = (columnId: string) => {
		setSelectedColumns((prev) =>
			prev.includes(columnId)
				? prev.filter((id) => id !== columnId)
				: [...prev, columnId],
		);
	};

	const handleFilterChange = (columnId: string, value: string) => {
		if (setFilters) {
			setFilters({
				...filters,
				[columnId]: value,
			});
		}
	};

	const renderHeader = (columnId: string) => {
		const config = columns.find((col) => col.id === columnId);
		if (!config) return columnId;

		// Only show sort for createdAt column
		if (columnId === "createdAt") {
			return (
				<Button
					variant="ghost"
					onClick={() => handleSort(columnId as string)}
					className="h-auto p-0 font-normal"
				>
					{config.label}
					{sortField === columnId && <SortIcon order={sortOrder} />}
				</Button>
			);
		}

		// Show filter dropdown for filterable columns
		if (config.filterable && config.filterOptions) {
			const currentFilter = filters[columnId] || "";
			const isFilterActive = currentFilter !== "";

			return (
				<div className="flex items-center gap-2">
					<span className="font-medium">{config.label}</span>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className={`h-6 w-6 p-0 ${isFilterActive ? "text-primary" : "text-muted-foreground"}`}
							>
								{isFilterActive ? (
									<Filter className="h-3 w-3 fill-current" />
								) : (
									<Filter className="h-3 w-3" />
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem
								onClick={() => handleFilterChange(columnId, "")}
								className={currentFilter === "" ? "bg-accent" : ""}
							>
								All
							</DropdownMenuItem>
							{config.filterOptions.map((option) => (
								<DropdownMenuItem
									key={option.value}
									onClick={() => handleFilterChange(columnId, option.value)}
									className={currentFilter === option.value ? "bg-accent" : ""}
								>
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		}

		// Default header for non-sortable, non-filterable columns
		return config.label;
	};

	const renderSkeletonRows = () => {
		return Array.from({ length: 5 }).map((_, index) => (
			<TableRow key={`skeleton-${index}`}>
				{selectedColumns.map((columnId) => (
					<TableCell key={columnId}>
						<Skeleton className="h-4 w-full rounded" />
					</TableCell>
				))}
				{renderActions && (
					<TableCell className="text-right">
						<div className="flex gap-2 justify-end">
							<Skeleton className="h-8 w-8 rounded" />
							<Skeleton className="h-8 w-8 rounded" />
						</div>
					</TableCell>
				)}
			</TableRow>
		));
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				{title && (
					<div className="flex items-center space-x-2">
						<h2 className="text-lg font-semibold">{title}</h2>
					</div>
				)}
				<div className="flex items-center space-x-2">
					{showSearch && (
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder={searchPlaceholder}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-8 w-64"
							/>
						</div>
					)}
					{showColumnCustomization && (
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="outline" size="sm">
									<Columns className="h-4 w-4 mr-2" />
									Columns
								</Button>
							</SheetTrigger>
							<SheetContent>
								<SheetHeader>
									<SheetTitle>Customize Table Columns</SheetTitle>
									<SheetDescription>
										Select which columns to display in the table.
									</SheetDescription>
								</SheetHeader>
								<div className="flex-1 py-6">
									<Accordion
										type="multiple"
										defaultValue={Object.keys(categoryColumns)}
										className="w-full p-4"
									>
										{Object.entries(categoryColumns).map(
											([category, columnIds]) => (
												<AccordionItem key={category} value={category}>
													<AccordionTrigger className="text-sm font-semibold capitalize">
														{category}
													</AccordionTrigger>
													<AccordionContent className="space-y-3 pt-2">
														{columnIds.map((columnId) => {
															const config = columns.find(
																(col) => col.id === columnId,
															);
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
											),
										)}
									</Accordion>
								</div>
								<SheetFooter>
									<SheetClose asChild>
										<Button variant="outline">Close</Button>
									</SheetClose>
								</SheetFooter>
							</SheetContent>
						</Sheet>
					)}
				</div>
			</div>

			<div className="rounded-md border">
				<TableWithScroll>
					<TableHeader>
						<TableRow>
							{selectedColumns.map((columnId) => (
								<TableHead key={columnId}>{renderHeader(columnId)}</TableHead>
							))}
							{renderActions && (
								<TableHead className="text-right">Actions</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							renderSkeletonRows()
						) : data.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={selectedColumns.length + (renderActions ? 1 : 0)}
									className="text-center"
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						) : (
							data.map((item, index) => (
								<TableRow key={index}>
									{selectedColumns.map((columnId) => (
										<TableCell key={columnId}>
											{renderCell(item, columnId)}
										</TableCell>
									))}
									{renderActions && (
										<TableCell className="text-right">
											{renderActions(item)}
										</TableCell>
									)}
								</TableRow>
							))
						)}
					</TableBody>
				</TableWithScroll>
			</div>

			{/* Pagination */}
			{showPagination && totalPages > 1 && onPageChange && (
				<div className="flex items-center justify-center space-x-2 py-4">
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => onPageChange(Math.max(1, currentPage - 1))}
									className={cn(
										"cursor-pointer",
										currentPage <= 1 && "pointer-events-none opacity-50",
									)}
								/>
							</PaginationItem>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								(page) => (
									<PaginationItem key={page}>
										<PaginationLink
											onClick={() => onPageChange(page)}
											isActive={currentPage === page}
											className="cursor-pointer"
										>
											{page}
										</PaginationLink>
									</PaginationItem>
								),
							)}
							<PaginationItem>
								<PaginationNext
									onClick={() =>
										onPageChange(Math.min(totalPages, currentPage + 1))
									}
									className={cn(
										"cursor-pointer",
										currentPage >= totalPages &&
											"pointer-events-none opacity-50",
									)}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</div>
	);
}
