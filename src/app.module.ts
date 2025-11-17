import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, UserModule, AuthModule],
})
export class AppModule {}
