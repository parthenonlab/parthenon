import { decrypt, DecryptionError, encrypt } from '@/lib/utils/encryption';

describe('encrypt / decrypt', () => {
  it('round-trips a string', () => {
    const value = 'hello world';
    expect(decrypt(encrypt(value))).toBe(value);
  });

  it('round-trips a numeric string', () => {
    const value = '500';
    expect(decrypt(encrypt(value))).toBe(value);
  });

  it('produces different ciphertexts for the same input (random IV)', () => {
    const value = 'same input';
    expect(encrypt(value)).not.toBe(encrypt(value));
  });

  it('throws DecryptionError for malformed ciphertext', () => {
    expect(() => decrypt('invalid:data')).toThrow(DecryptionError);
  });

  it('throws DecryptionError when the colon separator is missing', () => {
    expect(() => decrypt('nodivider')).toThrow(DecryptionError);
  });
});
