import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'John Kracker' })
  fullName: string;

  @IsEmail()
  @ApiProperty({ example: 'john@decisions.com' })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ example: 'password123' })
  password: string;
}

export interface MessageResponse {
  message: string;
}
