import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFlightNumber(input: string): string {
  // Remove any non-alphanumeric characters
  const cleaned = input.replace(/[^a-zA-Z0-9]/g, '');
  
  // Split into airline code and flight number
  const airlineCode = cleaned.slice(0, 2).toUpperCase();
  const flightNumber = cleaned.slice(2).replace(/^0+/, ''); // Remove leading zeros
  
  // Validate format
  if (!airlineCode.match(/^[A-Z]{2}$/) || !flightNumber.match(/^\d{1,4}$/)) {
    return input;
  }
  
  return `${airlineCode}${flightNumber}`;
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-EU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-EU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}