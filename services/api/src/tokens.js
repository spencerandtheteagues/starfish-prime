import crypto from 'crypto';

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}
export function sha256base64(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('base64');
}
export function addSeconds(date, s) {
  return new Date(date.getTime() + s * 1000);
}
