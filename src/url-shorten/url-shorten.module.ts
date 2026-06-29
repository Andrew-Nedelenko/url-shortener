import { Module } from '@nestjs/common';
import { UrlShortenController } from './url-shorten.controller';

@Module({
  controllers: [UrlShortenController],
})
export class UrlShortenModule {}
