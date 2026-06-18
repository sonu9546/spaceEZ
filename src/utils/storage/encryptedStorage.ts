import logger from "@/utils/logger";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_STORAGE_KEY || "default-weak-key";

/* ----------------------------------
   Environment guard
---------------------------------- */
const isBrowser =
  typeof window !== "undefined" &&
  typeof localStorage !== "undefined" &&
  typeof crypto !== "undefined";

/* ----------------------------------
   Crypto helpers
---------------------------------- */
async function getKey() {
  if (!isBrowser) return null;

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET_KEY.padEnd(32).slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(data: any) {
  if (!isBrowser) return null;

  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey();
    if (!key) return null;

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(JSON.stringify(data))
    );

    return JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    });
  } catch (e) {
    logger.warn("Encryption failed", e);
    return null;
  }
}

async function decrypt(value: string) {
  if (!isBrowser) return null;

  try {
    const { iv, data } = JSON.parse(value);
    const key = await getKey();
    if (!key) return null;

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data)
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (e) {
    logger.warn("Decryption failed", e);
    return null;
  }
}

/* ----------------------------------
   Redux Persist storage adapter
---------------------------------- */
export const encryptedStorage = {
  async getItem(key: string) {
    if (!isBrowser) return null;

    const item = localStorage.getItem(key);
    if (!item) return null;

    return decrypt(item);
  },

  async setItem(key: string, value: any) {
    if (!isBrowser) return;

    const encrypted = await encrypt(value);
    if (encrypted) {
      localStorage.setItem(key, encrypted);
    }
  },

  async removeItem(key: string) {
    if (!isBrowser) return;

    localStorage.removeItem(key);
  },
};
