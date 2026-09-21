import React from "react";
import { cn } from "@/core/utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800",
        className
      )}
      {...props}
    />
  );
}
