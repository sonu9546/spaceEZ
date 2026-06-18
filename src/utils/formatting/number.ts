/**
 * Format number with commas
 * @example 1234567 → "1,234,567"
 */
export const formatNumber = (value?: number | string): string => {
  if (value === null || value === undefined) return "";
  const num = Number(value);
  if (isNaN(num)) return "";

  return num.toLocaleString("en-US");
};

/**
 * Format currency with symbol
 * @example 1234567 → "₦1,234,567"
 */
export const formatCurrency = (
  value?: number | string,
  symbol: string = "₦"
): string => {
  if (value === null || value === undefined) return "";
  const num = Number(value);
  if (isNaN(num)) return "";

  return `${symbol}${num.toLocaleString("en-US")}`;
};

/**
 * Remove commas from a number string
 * @example "1,234,567" → 1234567
 */
export const removeComma = (value?: string): number => {
  if (!value) return 0;
  return Number(value.replace(/,/g, ""));
};

/**
 * Convert number to abbreviated format
 * @example 1500 → "1.5K", 1000000 → "1M"
 */
export const abbreviateNumber = (num = 0): string => {
  if (num < 1000) return num.toString();
  if (num < 100000) return num.toLocaleString("en-US");

  const units = ["K", "M", "B", "T"];
  let unitIndex = -1;

  while (num >= 1000 && unitIndex < units.length - 1) {
    num /= 1000;
    unitIndex++;
  }

  return `${parseFloat(num.toFixed(2))}${units[unitIndex]}`;
};

/**
 * Abbreviate currency format
 * @example 1500 → "$1.5K"
 */
export const abbreviateCurrency = (
  num = 0,
  symbol = "$"
): string => {
  if (num < 100000) {
    return `${symbol}${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${symbol}${abbreviateNumber(num)}`;
};

/**
 * Convert string/number to number safely
 */
export const toNumber = (value?: string | number, defaultValue = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};