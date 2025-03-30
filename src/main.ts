import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  // Lắng nghe cổng từ biến môi trường PORT (Render cung cấp)
  const port = process.env.PORT || 3333;

  // Bắt buộc phải dùng 0.0.0.0 thay vì localhost
  await app.listen(port, '0.0.0.0');
}
bootstrap();
