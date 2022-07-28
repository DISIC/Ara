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

const EASE_OF_USE = ['Oui', 'Moyen', 'Non'];

export class NewFeedbackDto {
  @IsString()
  @IsIn(EASE_OF_USE)
  easyToUse: string;

  @IsString()
  @IsIn(EASE_OF_USE)
  easyToUnderstand: string;

  @IsString()
  // @MaxLength(1000)
  feedback: string;

  @IsString()
  suggestions: string;

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
