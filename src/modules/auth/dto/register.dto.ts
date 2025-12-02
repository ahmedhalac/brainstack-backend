import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class RegisterDto {
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export interface RegisterResponse {
  message: string;
}
