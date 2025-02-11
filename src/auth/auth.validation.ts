import { IsAlphanumeric, IsString, Length, Matches } from "class-validator";

export class RegisterUserDto {
    @IsString()
    @Length(5, 64)
    email: string;

    @IsString()
    @Length(8, 64)
    @Matches(/(?=.[A-Z])(?=.[a-z])(?=.\d)(?=.[!@#$%^&*(),.?":{}|<>]).{8,}/, {
        message: 'password must be strong'
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