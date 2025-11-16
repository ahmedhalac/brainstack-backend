// prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Automatically makes PrismaService available across the whole application
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
