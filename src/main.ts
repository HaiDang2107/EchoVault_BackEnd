import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config } from 'dotenv';
import * as bodyParser from 'body-parser';
config(); // Load .env file
console.log(process.env.DATABASE_URL)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors();

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('EchoVault API')
    .setDescription('Automatically generated API documentation')
    .setVersion('1.0')
    .addServer('/') // Ensures correct base path on platforms like Render
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Accessible at /api

  // Increase payload size limit
  app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as needed
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Lắng nghe cổng từ biến môi trường PORT (Render cung cấp)
  const port = process.env.PORT || 3333;

  // Bắt buộc phải dùng 0.0.0.0 thay vì localhost
  await app.listen(port, '0.0.0.0');
}
bootstrap();
