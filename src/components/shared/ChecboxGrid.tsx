"use client";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MdOutlineExpandMore } from "react-icons/md";
import { Input } from "../shared/Input";
import { MagnifyingGlassIcon as SearchIcon } from "@radix-ui/react-icons";
import { TooltipProvider } from "../ui/tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { MdAddTask } from "react-icons/md";
import { toast } from "sonner";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";

type OptionInput =
	| string
	| { label: string; icon?: React.ReactNode; checked?: boolean };

export type InternalOption = {
	label: string;
	icon?: React.ReactNode;
	checked?: boolean;
};

interface CheckboxGridProps {
	options: OptionInput[];
	selectedOptions: InternalOption[];
	getSelectedOptons: (checkedItems: InternalOption[]) => void;
	disabled?: boolean;
	className?: string;
	itemOffset?: number;
	searchHandler?: (query: string) => void;
}

const normalizeOptions = (options: OptionInput[]): InternalOption[] =>
	options.map((opt) =>
		typeof opt === "string"
			? { label: opt, checked: false }
			: { ...opt, checked: opt.checked || false },
	);

export const CheckboxGrid: React.FC<CheckboxGridProps> = ({
	options: initialOptions,
	selectedOptions,
	getSelectedOptons,
	disabled,
	className,
	itemOffset = Number.POSITIVE_INFINITY,
	searchHandler,
}) => {
	const [options, setOptions] = useState<InternalOption[]>(() =>
		normalizeOptions(initialOptions),
	);
	const [offset, setOffset] = useState(itemOffset);
	const searchStr = useRef("");

	useEffect(() => {
		const selectedOptionsLabel = new Set(
			selectedOptions.map((opt) => opt.label),
		);
		const nonSelectedOptions = normalizeOptions(initialOptions).filter(
			(option) => !selectedOptionsLabel.has(option.label),
		);
		setOptions(nonSelectedOptions);
	}, [initialOptions, selectedOptions]);

	useEffect(() => {
		// Cleanup search results on unmount
		return () => {
			if (searchHandler) searchHandler("");
		};
	}, []);

	const handleCheckboxChange = (option: InternalOption) => {
		const updatedSelectedOptions = option.checked
			? selectedOptions.filter((opt) => opt.label !== option.label) // Uncheck
			: [...selectedOptions, { ...option, checked: true }]; // Check

		getSelectedOptons(updatedSelectedOptions);
	};

	const addLabel = () => {
		const option = normalizeOptions([
			capitalizeFirstLetter(searchStr.current),
		])[0];
		const isLabelExist = [...options, ...selectedOptions].some(
			(optn) => optn.label.toLowerCase() === option.label.toLowerCase(),
		);
		if (isLabelExist) {
			toast.error("Label already exists");
			return;
		}
		getSelectedOptons([{ ...option, checked: true }, ...selectedOptions]);
	};

	return (
		<div className="flex flex-col items-center gap-4">
			<div className={cn("flex flex-wrap gap-x-8 gap-y-4", className)}>
				{[...selectedOptions, ...options]
					.slice(0, searchHandler ? Math.min(itemOffset * 1.5, offset) : offset)
					.map((option, index) => (
						<div
							key={`option.label-${index}`}
							className="flex gap-2 items-center justify-center"
						>
							<Checkbox
								checked={option.checked}
								onCheckedChange={() => handleCheckboxChange(option)}
								disabled={disabled}
								id={option.label}
							/>
							<div className="flex gap-1 justify-center items-center">
								{option.icon && <div>{option.icon}</div>}
								<label className="capitalize" htmlFor={option.label}>
									{option.label?.toLowerCase()}
								</label>
							</div>
						</div>
					))}
			</div>

			{((offset < options.length && !searchHandler) || //if search not enabled, show view more until offset < options.length
				(offset < options.length &&
					offset === itemOffset && //if search enabled, show only if its first page and offset < options.length
					searchHandler)) && (
				<Button
					onClick={() => setOffset((prev) => prev + itemOffset)}
					variant="link"
					className="flex gap-2 items-center justify-center"
				>
					<span>View More</span>
					<MdOutlineExpandMore className="animate-bounce" />
				</Button>
			)}

			{searchHandler && offset > itemOffset && (
				<div className="flex gap-2 mt-4">
					<Input
						type="search"
						icon={SearchIcon}
						iconProps={{ behavior: "prepend" }}
						placeholder="Search..."
						onChange={(e) => {
							const str = e.target.value;
							searchStr.current = str;
							searchHandler(str);
						}}
					/>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									disabled={!searchStr.current}
									variant="ghost"
									size="icon"
									onClick={addLabel}
								>
									<MdAddTask />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Add to the list</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			)}
		</div>
	);
};
