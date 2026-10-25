import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConsoleLogger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'nest-lab',
    }),
  });
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Hotel Booking System API')
    .setDescription('Include information about the Room and Booking management APIs, and mention rate limiting (100 requests per minute)')
    .setVersion('1.0.0')
    .addTag('rooms')
    .addTag('bookings')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Use: Authorization: Bearer <access_token>',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Hotel API listening on port ${port}`);
}


bootstrap();
