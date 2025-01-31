import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type OptionInput =
	| string
	| { label: string; icon?: React.ReactNode; value?: string };
type InternalOption = {
	label: string;
	icon?: React.ReactNode;
};

interface RadioGroupGridProps {
	options: OptionInput[];
	onChange: (selectedLabel: string) => void;
	disabled?: boolean;
	className?: string;
	defaultLabel?: string;
}

const normalizeOptions = (options: OptionInput[]): InternalOption[] =>
	options.map((opt, index) =>
		typeof opt === "string" ? { label: opt } : { ...opt },
	);

const RadioGroupGrid: React.FC<RadioGroupGridProps> = ({
	options: initialOptions,
	onChange,
	disabled,
	className,
	defaultLabel,
}) => {
	const [options, setOptions] = useState<InternalOption[]>(() =>
		normalizeOptions([]),
	);
	const [selectedLabel, setSelectedLabel] = useState<string | undefined>(
		defaultLabel,
	);

	// ✅ Hydrate state after mount
	useEffect(() => {
		setOptions(normalizeOptions(initialOptions));
	}, [initialOptions]);

	const handleRadioChange = (label: string) => {
		setSelectedLabel(label);
		onChange(label);
	};

	return (
		<RadioGroup
			value={selectedLabel}
			onValueChange={handleRadioChange}
			className={cn("grid grid-cols-3 gap-4", className)}
			disabled={disabled}
		>
			{options.map((option) => (
				<div key={option.label} className="flex items-center">
					<RadioGroupItem value={option.label} id={option.label} />
					{option.icon && <span className="ml-2">{option.icon}</span>}
					<Label htmlFor={option.label} className="ml-2">
						{option.label}
					</Label>
				</div>
			))}
		</RadioGroup>
	);
};

export default RadioGroupGrid;
