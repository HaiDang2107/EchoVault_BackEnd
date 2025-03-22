import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default_secret', // JWT_SECRET: ký lên JWT token, xác minh JWT token từ client
  expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
}));
