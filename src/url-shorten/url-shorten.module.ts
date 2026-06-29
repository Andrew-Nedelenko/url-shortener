import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { UrlShortenController } from './url-shorten.controller';
import { UrlShortenService } from './url-shorten.service';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  controllers: [UrlShortenController],
  providers: [UrlShortenService],
})
export class UrlShortenModule {}
