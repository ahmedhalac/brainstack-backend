import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { MessageResponse, RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { LoginDto, LoginResponse } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<MessageResponse> {
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
          email: dto.email.toLowerCase().trim(),
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
      this.logger.error('Unexpected error during registration', error);
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

  async verifyEmail(dto: VerifyEmailDto): Promise<MessageResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, verificationCode: dto.verificationCode },
    });

    if (!user) {
      throw new BadRequestException('Verification code is invalid');
    }

    if (
      user.verificationCodeExpiresAt &&
      user.verificationCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    return { message: 'Email verified successfully' };
  }
}
