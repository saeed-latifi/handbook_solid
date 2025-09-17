// imports
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cm = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};
