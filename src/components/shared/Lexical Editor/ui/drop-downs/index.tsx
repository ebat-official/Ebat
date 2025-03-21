"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface values {
  icon?: React.ReactNode;
  label: string;
  desc?: string;
  func?: () => void;
  style?: React.CSSProperties;
  isSelected?: boolean;
  shortcuts?: string;

}
interface Props {
  TriggerLabel: React.ReactNode | string;
  TriggerClassName?: React.CSSProperties;
  PopoverContentClassName?: React.CSSProperties;
  values: values[];
  disabled: boolean;
  triggerVariants?:"ghost" | "default" |"outline" |"link" | "secondary" | "destructive"
  ShowChevronsUpDown?:boolean
  side?: "top" | "right" | "bottom" | "left" | undefined
  sideOffset?:number
}

export function DropDown({
  TriggerLabel,
  TriggerClassName,
  values,
  disabled,
  PopoverContentClassName,
  triggerVariants="outline",
  ShowChevronsUpDown=true,
  side="bottom",
  sideOffset=5
}: Props) {
  const [value, setValue] = React.useState("");

  return (
    <Popover  modal={false}>
      <PopoverTrigger  disabled={disabled} asChild>
        <Button
          variant={triggerVariants}
          role="combobox"
          size={"Toolbar"}
          style={TriggerClassName}
        >
          <div className="flex  flex-row justify-center gap-x-3 items-center">
            {TriggerLabel}
          </div>
          {ShowChevronsUpDown && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        sideOffset={sideOffset}
        style={PopoverContentClassName!}
        className="w-[200px] p-0 dropdown-portal"
      >
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No found.</CommandEmpty>
            <CommandGroup>
              {values.map((framework) => (
                <CommandItem
                  key={framework.label}
                  value={framework.label}
                  style={framework.style}
                  className={cn(
                    "cursor-pointer",
                    value === framework.label && "bg-gray-300/10",
                  )}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    if (framework.func) framework?.func();
                  }}
                >
                  <div className="flex w-full flex-row items-center justify-between">
                    <div className="flex  items-center gap-4 flex-row">
                      {framework.icon}
                      <div className="flex flex-col">
                        {framework.label}
                        <span className="text-sm text-muted-foreground">
                          {framework.desc}
                        </span>
                      </div>
                    </div>
                    {framework.shortcuts && (
                      <CommandShortcut>{framework.shortcuts}</CommandShortcut>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
