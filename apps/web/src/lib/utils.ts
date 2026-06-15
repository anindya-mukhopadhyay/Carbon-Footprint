import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCarbon(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value < 10 ? 1 : 0
  }).format(value);
}

export const formatKg = formatCarbon;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
