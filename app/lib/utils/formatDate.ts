/**
 * Formats a Date as MM/DD/YYYY.
 *
 * @param date - The date to format
 * @returns The formatted date string
 */
export const formatDate = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
