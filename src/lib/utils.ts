import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function calculateAge(birthDate?: string): number {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

import { MOTIVATIONAL_QUOTES } from "../data/quotes";

export function getDailyQuote(): string {
    const today = new Date();
    // Use full date string as seed (e.g., "2023-10-27")
    const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    // Simple hash function to get a consistent number for the date
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    // Use absolute value of hash modulo array length
    const index = Math.abs(hash) % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[index];
}
