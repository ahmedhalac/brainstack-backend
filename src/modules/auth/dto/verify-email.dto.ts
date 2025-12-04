import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d+$/, { message: 'Verification code must be numeric' })
  @ApiProperty({ example: '123456' })
  verificationCode: string;
}
