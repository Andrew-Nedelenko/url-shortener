import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { UrlShortenDto } from './dto/url-shorten-dto';
import { UrlShortenService } from './url-shorten.service';

@Controller('url')
export class UrlShortenController {
  constructor(private readonly urlShortenService: UrlShortenService) {}

  @Post('/shorten')
  async makeShortUrl(@Body() dto: UrlShortenDto) {
    const url = await this.urlShortenService.create(dto.url);
    return {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
    };
  }

  @Get('/:code')
  @HttpCode(302)
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.urlShortenService.incrementVisits(code);
    return res.redirect(url.originalUrl);
  }

  @Get('/stats/:code')
  async statsCode(@Param('code') code: string) {
    const url = await this.urlShortenService.getStats(code);
    return {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      visits: url.visits,
      createdAt: url.createdAt,
    };
  }
}
