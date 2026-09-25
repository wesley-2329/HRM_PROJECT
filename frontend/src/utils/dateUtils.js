/**
 * Centralized Date & Time Formatting Utilities
 * Converts UTC Date objects, ISO strings, or legacy timestamps into the viewing user's local timezone.
 */

export const formatTimeString = (dateVal, fallbackUncertain = false) => {
  if (!dateVal) return '--';
  
  // If dateVal is a string legacy formatted time e.g. "09:05 AM"
  if (typeof dateVal === 'string' && /^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(dateVal.trim())) {
    return fallbackUncertain ? `${dateVal.trim()} (legacy)` : dateVal.trim();
  }

  const dateObj = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(dateObj.getTime())) return '--';

  return dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDateString = (dateVal) => {
  if (!dateVal) return '--';
  const dateObj = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(dateObj.getTime())) return String(dateVal);

  return dateObj.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTimeString = (dateVal) => {
  if (!dateVal) return '--';
  const dateObj = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(dateObj.getTime())) return String(dateVal);

  return `${formatDateString(dateObj)} at ${formatTimeString(dateObj)}`;
};
