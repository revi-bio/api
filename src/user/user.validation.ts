import { IsAlphanumeric, IsEmail, IsString, IsStrongPassword, Length, MaxLength } from "class-validator";

export class EmailChangeDto {
    @IsString()
    @IsEmail()
    @Length(5, 64)
    email: string;
}

export class ChangeDisplayNameDto {
    @IsString()
    @IsEmail()
    @IsAlphanumeric()
    @Length(1, 32)
    displayName: string;
}

export class ChangePasswordDto {
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
