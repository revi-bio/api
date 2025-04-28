import { IsAlphanumeric, IsEmail, IsOptional, IsString, IsStrongPassword, Length, Matches, MaxLength } from 'class-validator';

export class CreateBioDto {
  @IsString()
  @Matches(/^[a-z0-9-_.]+$/)
  @Length(1, 32)
  handle: string;

  @IsString()
  @Length(1, 32)
  name: string;
}

export class EditBioDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-_.]+$/)
  @Length(1, 32)
  handle: string;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  name: string;

  @IsOptional()
  widgets: object;
}
