/**
 * Formats a Date as MM/DD/YYYY.
 *
 * @param date - The date to format
 * @returns The formatted date string
 */
export const formatDate = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;

export const formatTime = (date: Date) => {
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
};
