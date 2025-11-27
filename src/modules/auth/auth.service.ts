import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bycript from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email is already registered');
    }
    const hashedPassword = await bycript.hash(dto.password, 10);
    const code = Math.floor(100000 + Math.random() * 900000);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        isEmailVerified: false,
        verificationCode: code.toString(),
        verificationCodeExpiresAt: expires,
      },
    });

    await this.mailService.sendVerificationCode(user.email, code);

    return {
      message: 'Registration successful! Check your email for the code.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bycript.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Password doesn't match");
    }

    const token = await this.jwtService.signAsync({ userId: user.id });
    return { accessToken: token };
  }
}
