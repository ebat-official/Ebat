import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

function RightPanelLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row w-full h-full gap-2 justify-between overflow-x-hidden p-2",
        className
      )}
    >
      {children}
    </div>
  );
}

function MainPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-grow content  justify-self-center", className)}>
      {children}
    </div>
  );
}

function SidePanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative ">
      {/* Hidden Checkbox */}
      <input type="checkbox" id="sidepanel-toggle" className="hidden peer" />

      {/* Toggle Button */}
      <label
        htmlFor="sidepanel-toggle"
        className="hidden md:absolute z-50 w-8 h-8 bg-background -translate-x-[50%]  left-0 top-4 rounded-md shadow-md cursor-pointer md:flex justify-center items-center"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform ease-in-out duration-700 ",
            "peer-checked:rotate-180"
          )}
        />
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform ease-in-out duration-700 rotate-180",
            "peer-checked:rotate-180"
          )}
        />
      </label>

      {/* Side Panel */}
      <div
        className={cn(
          "rightsidebar bg-background md:w-[340px] xl:w-[400px] self-start relative top-0 right-0 h-full shadow-lg transition-[width,transform] duration-400", // Added transition for width
          "peer-checked:w-0 peer-checked:translate-x-full", // Collapse when checkbox is checked
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

RightPanelLayout.MainPanel = MainPanel;
RightPanelLayout.SidePanel = SidePanel;
export default RightPanelLayout;
