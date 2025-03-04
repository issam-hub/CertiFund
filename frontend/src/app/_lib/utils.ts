import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateTime = (dateTimeLocalString: string): string => {
  // Parse the input datetime-local string
  const date = new Date(dateTimeLocalString);
  
  // Get timezone offset in minutes
  const tzOffset = -date.getTimezoneOffset();
  const tzHours = Math.floor(Math.abs(tzOffset) / 60);
  const tzMinutes = Math.abs(tzOffset) % 60;
  
  // Format timezone string
  const tzSign = tzOffset >= 0 ? '+' : '-';
  const tzString = `${tzSign}${tzHours.toString().padStart(2, '0')}:${tzMinutes.toString().padStart(2, '0')}`;
  
  // Format the date to ISO string and modify it
  const formattedDate = date.toISOString()
    .replace('.000', '')  // Remove milliseconds
    .replace('Z', tzString);  // Replace Z with timezone offset
    
  return formattedDate;
}

export const reverseDateTimeFormat = (dateTimeString: string): string => {
  // Parse the date string to get the base date and timezone offset
  const matches = dateTimeString.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})([-+])(\d{2}):(\d{2})$/);
  
  if (!matches) {
    throw new Error("Invalid date format");
  }

  const [_, baseDate, sign, tzHours, tzMinutes] = matches;
  
  // Create a date object from the base part
  const date = new Date(baseDate);
  
  // Calculate offset in minutes
  const offsetMinutes = (parseInt(tzHours) * 60 + parseInt(tzMinutes)) * (sign === '+' ? 1 : -1);
  
  // Adjust the time by the offset
  date.setMinutes(date.getMinutes() + offsetMinutes);
  
  // Format the result
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatWebsiteUrl(url: string): string {
  if (!url) return ""
  return url.replace(/^https?:\/\/(www\.)?/, "")
}

export function formatTwitterHandle(handle: string): string {
  if (!handle) return ""
  return handle.startsWith("@") ? handle : `@${handle}`
}

export function getTwitterUrl(handle: string): string {
  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle
  return `https://twitter.com/${cleanHandle}`
}
