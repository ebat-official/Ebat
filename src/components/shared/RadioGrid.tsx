import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type OptionInput = string | { label: string };

type InternalOption = {
	label: string;
};

interface RadioGridProps {
	options: OptionInput[];
	getSelectedOption: (selected: string) => void;
	selectedOption?: string | undefined; // New prop for selected option
	className?: string;
	disabled?: boolean;
}

const normalizeOptions = (options: OptionInput[]): InternalOption[] =>
	options.map((opt) => (typeof opt === "string" ? { label: opt } : opt));

const RadioGrid: React.FC<RadioGridProps> = ({
	options: initialOptions,
	getSelectedOption,
	selectedOption, // Prop for the selected option
	className,
	disabled,
}) => {
	const [options] = useState<InternalOption[]>(() =>
		normalizeOptions(initialOptions),
	);
	const [selected, setSelected] = useState<string | undefined>(selectedOption);

	useEffect(() => {
		// Update selected state when selectedOption prop changes
		setSelected(selectedOption);
	}, [selectedOption]);

	const handleRadioChange = (value: string) => {
		setSelected(value);
		getSelectedOption(value);
	};

	return (
		<RadioGroup
			value={selected}
			onValueChange={handleRadioChange}
			className={cn("flex justify-around", className)}
			disabled={disabled}
		>
			{options.map((option) => (
				<div
					key={option.label}
					className="flex gap-2 items-center justify-center"
				>
					<RadioGroupItem value={option.label} id={option.label} />
					<Label className="capitalize" htmlFor={option.label}>
						{option.label.toLowerCase()}
					</Label>
				</div>
			))}
		</RadioGroup>
	);
};

export { RadioGrid };
