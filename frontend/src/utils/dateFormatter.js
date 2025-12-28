import { format, formatDistance, formatRelative } from 'date-fns';

/**
 * Format date to readable string
 */
export const formatDate = (date, formatStr = 'PPP') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

/**
 * Format date to relative date (e.g., "yesterday at 10:30 AM")
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  return formatRelative(new Date(date), new Date());
};

/**
 * Format date range
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  return `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d, yyyy')}`;
};

/**
 * Calculate days difference
 */
export const getDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};