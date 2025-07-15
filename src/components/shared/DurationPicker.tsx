"use client";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

// Define prop types for the component
interface DurationPickerProps {
	duration?: {
		days: string;
		hours: string;
		minutes: string;
	};
	onChange?: (duration: {
		days: string;
		hours: string;
		minutes: string;
	}) => void;
	disabled?: boolean;
}

const DurationPicker: React.FC<DurationPickerProps> = ({
	duration = { days: "0", hours: "0", minutes: "0" },
	onChange,
	disabled,
}) => {
	const [localDuration, setLocalDuration] = useState(duration);

	const handleChange = (value: string, unit: keyof typeof localDuration) => {
		const updatedDuration = { ...localDuration, [unit]: value };
		setLocalDuration(updatedDuration);

		// If onChange is provided, notify the parent component with the updated duration object
		if (onChange) {
			onChange(updatedDuration);
		}
	};

	return (
		<div className="flex flex-col gap-8 p-4 border rounded-lg bg-card text-card-foreground">
			<div className="flex justify-around items-center">
				{/* Days Select */}
				<div className="flex flex-col gap-2">
					<span className="text-sm text-muted-foreground mb-1">Days</span>
					<Select
						value={localDuration.days}
						onValueChange={(val) => handleChange(val, "days")}
						disabled={disabled}
					>
						<SelectTrigger className="gap-2">
							<SelectValue>{localDuration.days}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{Array.from({ length: 5 }, (_, i) => (
									<SelectItem key={i} value={i.toString()}>
										{i}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				{/* Hours Select */}
				<div className="flex flex-col gap-2">
					<span className="text-sm text-muted-foreground mb-1">Hours</span>
					<Select
						value={localDuration.hours}
						onValueChange={(val) => handleChange(val, "hours")}
						disabled={disabled}
					>
						<SelectTrigger className="gap-2">
							<SelectValue>{localDuration.hours}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{Array.from({ length: 24 }, (_, i) => (
									<SelectItem key={i} value={i.toString()}>
										{i}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				{/* Minutes Select */}
				<div className="flex flex-col gap-2">
					<span className="text-sm text-muted-foreground mb-1">Minutes</span>
					<Select
						value={localDuration.minutes}
						onValueChange={(val) => handleChange(val, "minutes")}
						disabled={disabled}
					>
						<SelectTrigger className="gap-2">
							<SelectValue>{localDuration.minutes}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{Array.from({ length: 60 }, (_, i) => (
									<SelectItem key={i} value={i.toString()}>
										{i}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Display Selected Duration */}
			<div className="text-sm flex gap-2">
				<span>Duration:</span>
				<span className="font-medium">
					{localDuration.days} days, {localDuration.hours} hours {"and "}
					{localDuration.minutes} minutes
				</span>
			</div>
		</div>
	);
};

export default DurationPicker;
