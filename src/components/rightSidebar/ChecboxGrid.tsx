import { useEffect, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MdOutlineExpandMore } from "react-icons/md";

type OptionInput =
	| string
	| { label: string; icon?: React.ReactNode; checked?: boolean };
type InternalOption = {
	label: string;
	icon?: React.ReactNode;
	checked: boolean;
};

interface CheckboxGridProps {
	options: OptionInput[];
	onChange: (checkedItems: string[]) => void;
	disabled?: boolean;
	className?: string;
	itemOffset?: number;
}

const normalizeOptions = (options: OptionInput[]): InternalOption[] =>
	options.map((opt) =>
		typeof opt === "string"
			? { label: opt, checked: false }
			: { ...opt, checked: opt.checked || false },
	);

const CheckboxGrid: React.FC<CheckboxGridProps> = ({
	options: initialOptions,
	onChange,
	disabled,
	className,
	itemOffset = Number.POSITIVE_INFINITY,
}) => {
	const [options, setOptions] = useState<InternalOption[]>(() =>
		normalizeOptions([]),
	);
	const [offset, setOffset] = useState(itemOffset);
	// ✅ Hydrate state after mount
	useEffect(() => {
		setOptions(normalizeOptions(initialOptions));
	}, [initialOptions]);

	const handleCheckboxChange = (index: number, checked: boolean) => {
		const updated = options.map((opt, i) =>
			i === index ? { ...opt, checked } : opt,
		);
		setOptions(updated);

		// Convert back to original format for parent
		const checkedItems = [];
		for (const optn of updated) {
			if (optn.checked) checkedItems.push(optn.label);
		}

		onChange(checkedItems);
	};

	return (
		<div className="flex flex-col items-center gap-4">
			<div className={cn("flex flex-wrap gap-x-8 gap-y-4", className)}>
				{options.slice(0, offset).map((option, index) => (
					<div
						key={option.label}
						className="flex gap-1 items-center justify-center"
					>
						<Checkbox
							checked={option.checked}
							onCheckedChange={(checked) =>
								handleCheckboxChange(index, !!checked)
							}
							disabled={disabled}
							id={option.label}
						/>
						{option.icon && <div>{option.icon}</div>}
						<label htmlFor={option.label}>{option.label}</label>
					</div>
				))}
			</div>
			{offset < options.length && (
				<Button
					onClick={() => setOffset((prev) => prev + itemOffset)}
					variant="link"
					className="flex gap-2 items-center justify-center "
				>
					<span>View More</span>
					<MdOutlineExpandMore className="animate-bounce" />
				</Button>
			)}
		</div>
	);
};

export default CheckboxGrid;
