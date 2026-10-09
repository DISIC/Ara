import { IsString } from "class-validator";

export class CreatePageRequestDto {
  @IsString()
  name: string;

  @IsString()
  url: string;
}
