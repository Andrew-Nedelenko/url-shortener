import { IsString } from 'class-validator';

export class UrlShortenDto {
  @IsString()
  url!: string;
}
