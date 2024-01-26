import crypto from 'crypto';

const defaultSecret = '43bce0a6a3244d72857fdb5bc7fa8506';

export function getHash(filename: string, secret?: string) {
  return crypto
    .createHmac('sha256', secret ?? defaultSecret)
    .update(filename)
    .digest('base64')
    .replace(/\W/g, '')
    .substring(0, 32);
}
