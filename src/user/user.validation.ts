import { IsString } from "class-validator";

export class RegisterUserDto {
    @IsString()
    email: string;

    @IsString()
    password: string;

    @IsString()
    displayName: string;
}