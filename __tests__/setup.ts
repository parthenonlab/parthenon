// AES-256 requires a 32-byte key — 64 hex chars
process.env.NEXT_PUBLIC_ENCRYPTION_KEY = 'a'.repeat(64);
