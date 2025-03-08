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

export function calculateDateDifference(targetDateStr:string) {
  // Parse the target date from the ISO 8601 string
  const targetDate = new Date(targetDateStr);
  
  // Get current date
  const currentDate = new Date();
  
  // Normalize both dates to start of day in UTC to avoid time zone issues
  const normalizedCurrentDate = new Date(Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  ));
  
  const normalizedTargetDate = new Date(Date.UTC(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  ));
  
  // If target date is in the past, return 0
  if (normalizedTargetDate < normalizedCurrentDate) {
    return "0 days left";
  }
  
  // Calculate the difference in milliseconds
  const diffTime = normalizedTargetDate.getTime() - normalizedCurrentDate.getTime();
  
  // Convert to days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate months and remaining days
  const months = Math.floor(diffDays / 30); // Approximate months
  const remainingDays = diffDays % 30;
  
  // Format the output according to requirements
  if (months === 0) {
    return `${diffDays} days left`;
  } else {
    return `${months} months, ${remainingDays} days left`;
  }
}

export function calculateDateDifferenceJSON(targetDateStr:string) {
  // Parse the target date from the ISO 8601 string
  const targetDate = new Date(targetDateStr);
  
  // Get current date
  const currentDate = new Date();
  
  // Normalize both dates to start of day in UTC to avoid time zone issues
  const normalizedCurrentDate = new Date(Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  ));
  
  const normalizedTargetDate = new Date(Date.UTC(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  ));
  
  // If target date is in the past, return 0 for both
  if (normalizedTargetDate < normalizedCurrentDate) {
    return { months: 0, days: 0 };
  }
  
  // Calculate the difference in milliseconds
  const diffTime = normalizedTargetDate.getTime() - normalizedCurrentDate.getTime();
  
  // Convert to days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate months and remaining days
  const months = Math.floor(diffDays / 30); // Approximate months
  const remainingDays = diffDays % 30;
  
  // Return JSON object
  return {
    months: months,
    days: remainingDays
  };
}
