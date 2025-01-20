"use client";
import { Menu } from "./menu";
import { SidebarToggle } from "./sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { PanelsTopLeft } from "lucide-react";
import Link from "next/link";
import { CategorySwitcher } from "./CategorySwitcher";


import {
	AudioWaveform,
	BookOpen,
	Bot,
	Command,
	Frame,
	GalleryVerticalEnd,
	Map,
	PieChart,
	Settings2,
	SquareTerminal,
} from "lucide-react";
import { FaReact } from "react-icons/fa";

export function Sidebar() {

  const category=[
    {
      name: "FrontEnd",
      logo: FaReact,
      logoClassName: "text-blue-500",
      // plan: "Enterprise",
      route:'/frontend'
    },
    {
      name: "Backend",
      logo: AudioWaveform,
      route:'/backend'
      // plan: "Startup",
    },
    {
      name: "Tools",
      logo: Command,
      route:'/tools'
      // plan: "Free",
    },
  ]


  const sidebar = useSidebar();
  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  console.log("sidebar", sidebar);
  return (
    <aside
      className={cn(
        "bg-background fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden"
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative  flex flex-col px-3 py-4 shadow-md dark:shadow-zinc-800"
      >
        <CategorySwitcher categories={category} />
        <Menu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}
