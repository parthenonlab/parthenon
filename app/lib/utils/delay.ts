/**
 * Returns a promise that resolves after a given number of milliseconds.
 *
 * @param ms - The number of milliseconds to wait
 * @returns A promise that resolves after the delay
 */
export const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
