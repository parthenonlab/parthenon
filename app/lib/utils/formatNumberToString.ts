/**
 * Formats a number as a locale-aware string using en-US formatting.
 *
 * @param n - The number to format.
 * @returns The formatted string (e.g. `1000` → `"1,000"`).
 */
export const formatNumberToString = (n: number): string => {
  return n.toLocaleString('en-US');
};
