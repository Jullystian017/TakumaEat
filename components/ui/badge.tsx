import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-gold",
        className
      )}
      {...props}
    />
  );
}
