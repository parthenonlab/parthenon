import crypto from 'crypto';

export class DecryptionError extends Error {
  constructor() {
    super('Invalid session data');
    this.name = 'DecryptionError';
  }
}

const algorithm = 'aes-256-cbc';
const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

if (!encryptionKey || encryptionKey.length === 0) {
  throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY environment variable is not set');
}

const key = Uint8Array.from(Buffer.from(encryptionKey, 'hex'));

/**
 * Encrypts a string using AES-256-CBC with a random IV.
 * Returns a colon-separated string of `<iv>:<ciphertext>` in hex.
 *
 * @param value - The plaintext string to encrypt
 * @returns The encrypted string in `iv:ciphertext` hex format
 */
export const encrypt = (value: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, Uint8Array.from(iv));

  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts a string produced by `encrypt`.
 * Expects a colon-separated `<iv>:<ciphertext>` hex string.
 *
 * @param encryptedText - The encrypted string in `iv:ciphertext` hex format
 * @returns The original plaintext string
 * @throws {DecryptionError} If the input is malformed or decryption fails
 */
export const decrypt = (encryptedText: string): string => {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Uint8Array.from(Buffer.from(ivHex, 'hex'));
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    throw new DecryptionError();
  }
};
