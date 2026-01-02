/**
 * Date Formatting and Manipulation Utilities
 */

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (date: Date | string, formatString: string = 'MMM d, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format time for display
 */
export const formatTime = (date: Date | string, formatString: string = 'h:mm a'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: Date | string, formatString: string = 'MMM d, yyyy h:mm a'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Format date with context (Today, Yesterday, or date)
 */
export const formatDateWithContext = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
      return 'Today';
    } else if (isYesterday(dateObj)) {
      return 'Yesterday';
    } else {
      return format(dateObj, 'MMM d, yyyy');
    }
  } catch (error) {
    console.error('Error formatting date with context:', error);
    return '';
  }
};

/**
 * Format for activity feed display
 */
export const formatActivityTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
      return formatTime(dateObj);
    } else if (isYesterday(dateObj)) {
      return `Yesterday ${formatTime(dateObj)}`;
    } else {
      return formatDateTime(dateObj);
    }
  } catch (error) {
    console.error('Error formatting activity time:', error);
    return '';
  }
};

/**
 * Format medication time (just time, no date)
 */
export const formatMedicationTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting medication time:', error);
    return timeString;
  }
};

/**
 * Check if date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj < new Date();
  } catch (error) {
    console.error('Error checking if date is past:', error);
    return false;
  }
};

/**
 * Check if date is in the future
 */
export const isFuture = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj > new Date();
  } catch (error) {
    console.error('Error checking if date is future:', error);
    return false;
  }
};

/**
 * Get start of day
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get end of day
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatDateWithContext,
  formatActivityTime,
  formatMedicationTime,
  isPast,
  isFuture,
  getStartOfDay,
  getEndOfDay,
};
