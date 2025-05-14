
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get country name from country code
export function getCountryName(code: string, countries: {code: string, name: string}[]): string {
  return countries.find(c => c.code === code)?.name || code;
}

// Format coordinates for display
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}

// Get approximate region from coordinates
export function getRegionFromCoordinates(lat: number, lng: number): string {
  if (lat > 20 && lat < 70 && lng > -130 && lng < -50) {
    return "North America";
  } else if (lat > 35 && lat < 70 && lng > -10 && lng < 40) {
    return "Europe";
  } else if (lat > -50 && lat < 15 && lng > -80 && lng < -30) {
    return "South America";
  } else if (lat > -45 && lat < 30 && lng > 10 && lng < 60) {
    return "Africa";
  } else if (lat > -10 && lat < 60 && lng > 60 && lng < 150) {
    return "Asia";
  } else if (lat > -50 && lat < -10 && lng > 110 && lng < 180) {
    return "Australia/Oceania";
  } else {
    return "Unknown Region";
  }
}
