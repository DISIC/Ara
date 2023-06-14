import { IsOptional, IsString } from 'class-validator';

export class PatchAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  orgName?: string;
}
