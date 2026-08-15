"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<
  React.ComponentProps<"button">,
  "onChange" | "type"
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function Checkbox({
  checked = false,
  onCheckedChange,
  className,
  ...props
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-input bg-card transition-colors",
        "hover:border-teal-500 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/40",
        checked && "border-teal-600 bg-teal-600 text-white",
        className
      )}
      {...props}
    >
      {checked ? (
        <svg
          viewBox="0 0 16 16"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}

export { Checkbox };
