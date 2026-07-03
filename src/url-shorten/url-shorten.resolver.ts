import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UrlShortenService } from './url-shorten.service';
import { ShortenUrlInput } from './dto/url-shorten-gql.input';
import { ShortenResult, StatsResult } from './dto/url-shorten-gql.types';

@Resolver()
export class UrlShortenResolver {
  constructor(private readonly urlShortenService: UrlShortenService) {}

  @Mutation(() => ShortenResult)
  async shortenUrl(
    @Args('body') body: ShortenUrlInput,
  ): Promise<ShortenResult> {
    const url = await this.urlShortenService.create(body.url);
    return {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
    };
  }

  @Query(() => StatsResult, { name: 'urlStats' })
  async urlStats(
    @Args('code', { type: () => String }) code: string,
  ): Promise<StatsResult> {
    const url = await this.urlShortenService.getStats(code);
    return {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      visits: url.visits,
      createdAt: url.createdAt,
    };
  }

  @Query(() => String, { name: 'resolveUrl' })
  async resolveUrl(
    @Args('code', { type: () => String }) code: string,
  ): Promise<string> {
    const url = await this.urlShortenService.findByCode(code);
    await this.urlShortenService.incrementVisits(code);
    return url.originalUrl;
  }
}
