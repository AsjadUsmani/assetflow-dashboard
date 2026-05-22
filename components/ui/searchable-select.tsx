"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type SearchableSelectOption = {
  value: string;
  label: string;
  searchValue?: string;
  /** Secondary line (e.g. email under name) */
  description?: string;
  /** Small status tags shown under the label */
  badges?: string[];
};

function SelectedValue({ option }: { option: SearchableSelectOption }) {
  if (option.description) {
    return (
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
        <span className="w-full truncate font-medium leading-tight">{option.label}</span>
        <span className="w-full truncate text-xs text-muted-foreground">{option.description}</span>
      </span>
    );
  }
  return <span className="min-w-0 flex-1 truncate text-left">{option.label}</span>;
}

function OptionRow({ option }: { option: SearchableSelectOption }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
      <span className="font-medium leading-snug">{option.label}</span>
      {option.description ? (
        <span className="text-xs text-muted-foreground">{option.description}</span>
      ) : null}
      {option.badges && option.badges.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {option.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {badge}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Search or select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          className={`h-auto min-h-10 w-full justify-between gap-2 py-2 font-normal ${className ?? ""}`}
        >
          {selected ? (
            <SelectedValue option={selected} />
          ) : (
            <span className="min-w-0 flex-1 truncate text-left text-muted-foreground">
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[200] w-[var(--radix-popover-trigger-width)] min-w-[min(100%,20rem)] p-0"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-64">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.searchValue ?? `${option.label} ${option.description ?? ""}`}
                  className="items-start py-2"
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <OptionRow option={option} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
