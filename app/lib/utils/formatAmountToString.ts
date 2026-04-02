/**
 * Formats a number as a locale-aware string using en-US formatting.
 *
 * @param amount - The number to format.
 * @returns The formatted string (e.g. `1000` → `"1,000"`).
 */
export const formatAmountToString = (amount: number): string => {
  return amount.toLocaleString('en-US');
};
