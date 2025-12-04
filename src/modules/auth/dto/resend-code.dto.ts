import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ResendCodeDto {
    @IsEmail()
    @ApiProperty({ example: 'johndoe@example.com' })
    email: string;
}