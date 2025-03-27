import { IsAlphanumeric, IsEmail, IsString, IsStrongPassword, Length, MaxLength } from "class-validator";

export class CreateBioDto {
  @IsString()
  @IsAlphanumeric()
  @Length(1, 32)
  handle: string;

  @IsString()
  @Length(1, 32)
  name: string;
}
