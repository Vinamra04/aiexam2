import { promisify } from 'util';
import { jwtConstants } from 'src/auth/constant';
const crypto = require('crypto');

const randomBytes = promisify(crypto.randomBytes);
const pbkdf2 = promisify(crypto.pbkdf2);
import { User } from './user/data';

export function isAdmin(user: User) {
  return user.role === 'admin';
}

const encryptionKey = crypto.randomBytes(32); // Key should be 32 bytes for aes-256-cbc

export function encrypt(text) {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16); // Initialization vector should be 16 bytes

  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText) {
  const algorithm = 'aes-256-cbc';
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex'); // Get the IV from the first part
  const encryptedTextBuffer = Buffer.from(textParts.join(''), 'hex'); // Join remaining parts as the encrypted text

  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
  let decrypted = decipher.update(encryptedTextBuffer, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
// export function mapDtoToWhereable<T, U>(
//   dto: T,
//   typeMap: { [key in keyof T]?: (value: any) => any },
// ): Partial<U> {
//   const where: Partial<U> = {};

//   for (const key in dto) {
//     if (dto[key] !== undefined && dto[key] !== null) {
//       if (typeMap[key]) {
//         where[key as keyof U] = typeMap[key](dto[key]);
//       } else {
//         where[key as keyof U] = dto[key];
//       }
//     }
//   }

//   return where;
// }
