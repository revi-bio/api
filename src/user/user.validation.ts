import { IsAlphanumeric, IsEmail, IsString, IsStrongPassword, Length, MaxLength } from "class-validator";

export class ChangeDisplayNameDto {
    @IsString()
    @IsAlphanumeric()
    @Length(1, 32)
    displayName: string;
}

export class EmailChangeDto {
    @IsString()
    currentPassword: string;

    @IsString()
    @IsEmail()
    @Length(5, 64)
    email: string;
}

export class ChangePasswordDto {
    @IsString()
    currentPassword: string;

    @IsString()
    @MaxLength(64)
    @IsStrongPassword({
        minLength: 8,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1,
    })
    password: string;
}
