import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Aldaba Job Scraper API')
    .setDescription('API for scraping job listings from Aldaba.com and sending WhatsApp notifications')
    .setVersion('1.0')
    .addTag('jobs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
  logger.log(`📚 Swagger documentation: http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
