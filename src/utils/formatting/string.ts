/**  
 * Trims a string safely.  
 * removeAllSpaces → removes ALL whitespace, not just around  
 */
export const trimString = (
  value: unknown,
  removeAllSpaces = false
): string => {
  if (typeof value !== "string") return "";
  return removeAllSpaces ? value.replace(/\s+/g, "") : value.trim();
};

/**  
 * Safely converts any input to string  
 */
export const convertToString = (
  value: unknown,
  fallback = ""
): string => {
  if (value == null) return fallback;

  try {
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  } catch {
    return fallback;
  }
};

/**  
 * Normalizes email → lowercased + trimmed  
 */
export const formatEmail = (email?: string): string => {
  if (!email) return "";
  return email.trim().toLowerCase();
};
