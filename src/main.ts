import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Your Project API')
    .setDescription('Automatically generated API documentation')
    .setVersion('1.0')
    .addServer('/') // Ensures correct base path on platforms like Render
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Accessible at /api

  // Lắng nghe cổng từ biến môi trường PORT (Render cung cấp)
  const port = process.env.PORT || 3333;

  // Bắt buộc phải dùng 0.0.0.0 thay vì localhost
  await app.listen(port, '0.0.0.0');
}
bootstrap();
