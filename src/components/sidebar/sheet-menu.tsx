import { MenuIcon, PanelsTopLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { useMobileSidebar } from "@/utils/routeUtils";
import { usePathname } from "next/navigation";
import { CategorySwitcher } from "./CategorySwitcher";
import { Navigation } from "./Navigation";
import { Menu } from "./menu";

export function SheetMenu() {
	const { mobileNav } = useSidebar();
	const shouldHideSidebar = useMobileSidebar();

	return (
		<Sheet>
			<SheetTrigger
				className={cn(mobileNav || shouldHideSidebar ? "" : "lg:hidden")}
				asChild
			>
				<Button className="h-8" variant="outline" size="icon">
					<MenuIcon size={20} />
				</Button>
			</SheetTrigger>
			<SheetContent className="sm:w-72  px-3 h-full flex flex-col" side="left">
				<SheetHeader className="mt-4">
					<CategorySwitcher />
				</SheetHeader>
				<Navigation isOpen />
				<Menu isOpen />
			</SheetContent>
		</Sheet>
	);
}
