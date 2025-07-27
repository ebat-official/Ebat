"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/db/schema/enums";
import { userRoleOptions } from "../constants";
import { Shield, User, Edit, ShieldCheck, Crown } from "lucide-react";

interface RoleDropdownProps {
	value: UserRole;
	onChange: (role: UserRole) => void;
	disabled?: boolean;
	className?: string;
	availableRoles?: UserRole[];
}

const roleIcons = {
	[UserRole.SUPER_ADMIN]: Crown,
	[UserRole.ADMIN]: Shield,
	[UserRole.USER]: User,
	[UserRole.EDITOR]: Edit,
	[UserRole.MODERATOR]: ShieldCheck,
};

export function RoleDropdown({
	value,
	onChange,
	disabled,
	className,
	availableRoles,
}: RoleDropdownProps) {
	const IconComponent = roleIcons[value];

	// Filter available roles if provided, otherwise use all roles
	const rolesToShow = availableRoles
		? userRoleOptions.filter((option) => availableRoles.includes(option.value))
		: userRoleOptions;

	return (
		<Select
			value={value}
			onValueChange={(newValue) => onChange(newValue as UserRole)}
			disabled={disabled}
		>
			<SelectTrigger className={`w-32 ${className}`}>
				<SelectValue>
					<div className="flex items-center gap-2">
						<IconComponent className="h-3 w-3" />
						{value}
					</div>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{rolesToShow.map((option) => {
					const OptionIcon = roleIcons[option.value];

					return (
						<SelectItem key={option.value} value={option.value}>
							<div className="flex items-center gap-2">
								<OptionIcon className="h-3 w-3" />
								{option.label}
							</div>
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}
