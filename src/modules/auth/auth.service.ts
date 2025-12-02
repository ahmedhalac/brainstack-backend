import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto, RegisterResponse } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { LoginDto, LoginResponse } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
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
    } catch (error) {
      console.error('Registration failed:', error);
      throw new InternalServerErrorException(
        'Failed to register user. Please try again later.',
      );
    }
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const isMatch = user
      ? await bcrypt.compare(dto.password, user.password)
      : false;
    if (!user || !isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync({ userId: user.id });
    return { accessToken: token };
  }
}
