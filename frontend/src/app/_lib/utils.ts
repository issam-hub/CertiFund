import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Comment } from "./types";

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

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // Get time difference in milliseconds
  const diffMs = now.getTime() - date.getTime();
  
  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);
  
  // Less than 60 seconds
  if (diffSec < 60) {
    return "just now";
  }
  
  // Minutes (less than 60 minutes)
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Hours (less than 24 hours)
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Days (less than 30 days)
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  // Months (less than 12 months)
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  }
  
  // Years
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
}

export function transformComments(comments: any[]): Comment[] {
  // Create a map to store comments by their ID
  const commentMap = new Map<number, Comment>();

  // First pass: Create base comment objects
  comments.forEach(comment => {
    const formattedComment: Comment = {
      id: comment.id,
      content: comment.content,
      username: comment.username,
      image_url: comment.image_url || "/placeholder.svg",
      created_at: formatRelativeTime(comment.created_at),
      replies: [],
      path: comment.path
    };
    commentMap.set(comment.id, formattedComment);
  });

  // Second pass: Build nested structure
  const rootComments: Comment[] = [];
  comments.forEach(comment => {
    const pathParts = comment.path.split(',').map(Number);
    
    if (pathParts.length === 1) {
      // Root comment
      rootComments.push(commentMap.get(comment.id)!);
    } else {
      // This is a reply
      const parentId = pathParts[pathParts.length - 2];
      const parentComment = commentMap.get(parentId);
      const currentComment = commentMap.get(comment.id);

      if (parentComment && currentComment) {
        if (!parentComment.replies) {
          parentComment.replies = [];
        }
        parentComment.replies.push(currentComment);
      }
    }
  });

  return rootComments;
}

export function formatDateTimeSecond(isoDateString: string): string {
  // Create a Date object from the ISO string
  const date = new Date(isoDateString);
  
  // Extract month, day, year (add leading zeros where needed)
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  // Get hours for AM/PM format
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours || 12; // Convert 0 to 12 for 12 AM
  
  // Format hours, minutes, seconds with leading zeros
  const formattedHours = String(hours).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // Put it all together
  return `${month}-${day}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

export function extractFilenameFromSupabaseUrl(url: string): string | null {
  try {
    // Use URL object to parse the URL
    const parsedUrl = new URL(url);
    
    // Get the pathname (everything after the domain)
    const pathname = parsedUrl.pathname;
    
    // Split the pathname by '/'
    const pathParts = pathname.split('/');
    
    // Filter out empty strings and get the last part which should contain the filename
    const lastPart = pathParts.filter(part => part.length > 0).pop();
    
    if (!lastPart) {
      return null;
    }
    
    // If the URL has query parameters or additional path segments after the filename,
    // we need to extract just the filename part
    const filenameMatch = lastPart.match(/^([^?#]+)/);
    const filename = filenameMatch ? filenameMatch[1] : lastPart;
    
    return decodeURIComponent(filename);
  } catch (error) {
    console.error("Error extracting filename from URL:", error);
    return null;
  }
}

export function toCamelCase(str: string): string {
  // Split the string by spaces
  const words = str.split(' ');
  
  // If empty string or no words, return empty string
  if (words.length === 0) {
    return '';
  }
  
  // Start with the first word in lowercase
  let result = words[0].toLowerCase();
  
  // For each subsequent word, capitalize the first letter and append
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (word.length > 0) {
      // Capitalize first letter and append rest of word
      result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  }
  
  return result;
}

export const ExpertsDecisionDetails = {
  "highly recommended": "Exceptional project with strong potential for success and impact",
  "recommended":"Solid project with good potential and minimal concerns",
  "neutral":"Average project with balanced strengths and weaknesses",
  "not recommended": "Project with significant concerns or weaknesses",
  "highly not recommended": "Project with critical flaws or serious concerns",
  "unverified": "Experts didn't decide yet"
}