import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enableShutdownHooks allows Prisma to listen to NestJS shutdown events and clean up connections.
  // Without this, Prisma may leave hanging connections if you stop the app with CTRL+C
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
