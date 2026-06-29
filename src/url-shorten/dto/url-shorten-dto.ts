import { IsUrl } from 'class-validator';

export class UrlShortenDto {
  @IsUrl(
    { require_protocol: true },
    { message: 'A valid URL with protocol (http/https) is required' },
  )
  url!: string;
}
