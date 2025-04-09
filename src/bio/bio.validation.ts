import { IsAlphanumeric, IsEmail, IsOptional, IsString, IsStrongPassword, Length, MaxLength } from "class-validator";

export class CreateBioDto {
  @IsString()
  @IsAlphanumeric()
  @Length(1, 32)
  handle: string;

  @IsString()
  @Length(1, 32)
  name: string;
}

export class EditBioDto {
  @IsOptional()
  @IsString()
  @IsAlphanumeric()
  @Length(1, 32)
  handle: string;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  name: string;

  @IsOptional()
  widgets: object;
}
