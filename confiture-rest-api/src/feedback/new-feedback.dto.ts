import { IsArray, IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

const OCCUPATIONS = [
  'Designer (ou lead)',
  'Développeur / Développeuse (ou lead)',
  'Chef / Cheffe de projet (product manager)',
  'Chef / Cheffe de produit (product owner)',
  'Auditeur / Auditrice accessibilité',
  'Référent / Référente accessibilité',
  'Autre',
];

const EASE_OF_USE = ['Oui', 'Moyen', 'Non'];

export class NewFeedbackDto {
  /**
   * @example "Moyen"
   */
  @IsString()
  @IsIn(EASE_OF_USE)
  easyToUse: string;

  /**
   * @example "Oui"
   */
  @IsString()
  @IsIn(EASE_OF_USE)
  easyToUnderstand: string;

  /**
   * @example "Très pratique !"
   */
  @IsString()
  feedback: string;

  /**
   * @example "Un bouton pour faire ceci ou celà."
   */
  @IsString()
  suggestions: string;

  /**
   * @example "Pierre Poljak"
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * @example "person@organization.com"
   */
  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * @example ["Designer", "Chef de produit"]
   */
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  // FIXME: the @nestjs/swagger CLI plugin doesnt seem to pick up on the each option
  // see: https://github.com/nestjs/swagger/issues/2027
  @IsIn(OCCUPATIONS, { each: true })
  occupations?: string[];
}
