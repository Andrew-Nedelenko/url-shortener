import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { UrlShortenController } from './url-shorten.controller';
import { UrlShortenService } from './url-shorten.service';
import { UrlShortenResolver } from './url-shorten.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  controllers: [UrlShortenController],
  providers: [UrlShortenService, UrlShortenResolver],
})
export class UrlShortenModule {}
