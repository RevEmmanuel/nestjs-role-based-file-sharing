import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto
  .createHash('sha256')
  .update(String(process.env.FILE_ENCRYPTION_KEY || 'default_key'))
  .digest();

export function encryptBuffer(buffer: Buffer) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encrypted, iv: iv.toString('hex') };
}
