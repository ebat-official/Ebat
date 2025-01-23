import Link from "next/link";
import { MenuIcon, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "./menu";
import {
	Sheet,
	SheetHeader,
	SheetContent,
	SheetTrigger,
	SheetTitle,
} from "@/components/ui/sheet";
import { CategorySwitcher } from "./CategorySwitcher";
import { Navigation } from "./Navigation";

export function SheetMenu() {
	return (
		<Sheet>
			<SheetTrigger className="lg:hidden" asChild>
				<Button className="h-8" variant="outline" size="icon">
					<MenuIcon size={20} />
				</Button>
			</SheetTrigger>
			<SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
				<SheetHeader className="mt-4">
					<CategorySwitcher />
				</SheetHeader>
				<Navigation isOpen />
				<Menu isOpen />
			</SheetContent>
		</Sheet>
	);
}
