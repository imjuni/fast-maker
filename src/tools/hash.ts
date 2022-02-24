import crypto from 'crypto';

const secret = '43bce0a6a3244d72857fdb5bc7fa8506';

export default function getHash(filename: string) {
  return crypto.createHmac('sha256', secret).update(filename).digest('base64').replace(/\W/g, '').substring(0, 32);
}
