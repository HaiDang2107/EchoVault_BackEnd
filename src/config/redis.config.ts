import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: 10157,
  password: process.env.REDIS_PASSWORD || '',
  ttl: 300, // Default TTL (time-to-live) in seconds
}));