import { IsAlphanumeric, IsEmail, IsString, IsStrongPassword, Length, Matches, MaxLength } from "class-validator";

export class RegisterUserDto {
    @IsString()
    @IsEmail()
    @Length(5, 64)
    email: string;

    @IsString()
    @MaxLength(64)
    @IsStrongPassword({
        minLength: 8,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1,
    })
    password: string;

    @IsString()
    @IsAlphanumeric()
    @Length(1, 32)
    displayName: string;
}

export class LoginUserDto {
    @IsString()
    email: string;

    @IsString()
    password: string;
}