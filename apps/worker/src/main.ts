import './otel'; // Must be first!
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  await app.listen(3003);
  console.log(`🚀 Worker service running on http://localhost:3003`);
}
bootstrap();
