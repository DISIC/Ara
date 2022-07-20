import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  // MaxLength,
} from 'class-validator';

export class NewFeedbackDto {
  @IsString()
  // @MaxLength(1000)
  feedback: string;

  @IsString()
  @IsOptional()
  // @MaxLength(150)
  name?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  // @MaxLength(100)
  email?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  // @MaxLength(50, { each: true })
  occupations?: string[];
}
