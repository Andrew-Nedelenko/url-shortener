import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class UrlResponse {
  @Field(() => ID)
  id!: number;

  @Field()
  shortCode!: string;

  @Field()
  originalUrl!: string;

  @Field(() => Int)
  visits!: number;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class ShortenResult {
  @Field()
  shortCode!: string;

  @Field()
  originalUrl!: string;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class StatsResult {
  @Field()
  shortCode!: string;

  @Field()
  originalUrl!: string;

  @Field(() => Int)
  visits!: number;

  @Field()
  createdAt!: Date;
}
