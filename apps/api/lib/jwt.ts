import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/shared/constants';

const signJwt = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

const decodeJwt = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export { signJwt, decodeJwt };