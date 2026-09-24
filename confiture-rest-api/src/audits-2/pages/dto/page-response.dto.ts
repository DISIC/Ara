import { Expose } from "class-transformer";

export class PageResponseDto {
  @Expose()
  name: string;

  @Expose()
  url: string;

  @Expose()
  order: number;

  @Expose()
  slug: string;
}
