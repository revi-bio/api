import { IsBoolean, IsMongoId, IsOptional, IsString, Length } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  @Length(1, 500)
  text: string;

  @IsString()
  @IsMongoId()
  userId: string;
}

export class EditMessageDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  title: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  text: string;

  @IsOptional()
  @IsBoolean()
  isRead: boolean;
}