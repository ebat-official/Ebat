"use client";

import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const DurationPicker = () => {
	const [duration, setDuration] = useState({
		days: "0",
		hours: "0",
		minutes: "0",
	});

	const handleChange = (value: string, unit: keyof typeof duration) => {
		setDuration((prev) => ({
			...prev,
			[unit]: value,
		}));
	};

	return (
		<div className="flex flex-col gap-8 p-4 border rounded-lg bg-card text-card-foreground">
			<div className="flex justify-around items-center">
				{/* Days Select */}
				<div className="flex flex-col gap-2">
					<span className="text-sm text-muted-foreground mb-1">Days</span>
					<Select
						value={duration.days}
						onValueChange={(val) => handleChange(val, "days")}
					>
						<SelectTrigger className="gap-2">
							<SelectValue>{duration.days}</SelectValue>
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
						value={duration.hours}
						onValueChange={(val) => handleChange(val, "hours")}
					>
						<SelectTrigger className="gap-2">
							<SelectValue>{duration.hours}</SelectValue>
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
						value={duration.minutes}
						onValueChange={(val) => handleChange(val, "minutes")}
					>
						<SelectTrigger className="gap-2">
							<SelectValue>{duration.minutes}</SelectValue>
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
					{duration.days} days, {duration.hours} hours, {duration.minutes}{" "}
					minutes
				</span>
			</div>
		</div>
	);
};

export default DurationPicker;
