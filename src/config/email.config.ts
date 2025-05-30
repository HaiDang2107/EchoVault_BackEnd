import { registerAs } from '@nestjs/config';

export const emailConfig = registerAs('email', () => ({
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
}));
