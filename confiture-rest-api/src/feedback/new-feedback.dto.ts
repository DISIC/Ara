import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  // MaxLength,
} from 'class-validator';

const OCCUPATIONS = [
  'Designer',
  'Développeur',
  'Chef de projet',
  'Chef de produit',
  'Décideur',
  'Référent accessibilité',
  'Autre',
];

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
  @IsIn(OCCUPATIONS, { each: true })
  // @MaxLength(50, { each: true })
  occupations?: string[];
}
