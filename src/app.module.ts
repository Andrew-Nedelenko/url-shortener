import { Module } from '@nestjs/common';
import { UrlShortenModule } from './url-shorten/url-shorten.module';

@Module({
  imports: [UrlShortenModule],
})
export class AppModule {}
