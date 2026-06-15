import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-soil/10 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-tide",
        className
      )}
      {...props}
    />
  );
}
