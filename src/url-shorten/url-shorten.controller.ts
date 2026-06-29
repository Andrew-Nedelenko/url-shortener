import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UrlShortenDto } from './dto/url-shorten-dto';

@Controller('url')
export class UrlShortenController {
  @Post('/shorten')
  makeShortUrl(@Body() { url }: UrlShortenDto) {
    return { msg: 'shorten ok', url };
  }

  @Get('/:code')
  getCode(@Param('code') code: string) {
    return { msg: 'code ok', code };
  }

  @Get('/stats/:code')
  statsCode(@Param('code') code: string) {
    return { msg: 'stats code ok', code };
  }
}
