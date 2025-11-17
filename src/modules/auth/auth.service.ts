import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bycript from 'bcrypt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bycript.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
      },
    });
    return { id: user.id, email: user.email };
  }
}
