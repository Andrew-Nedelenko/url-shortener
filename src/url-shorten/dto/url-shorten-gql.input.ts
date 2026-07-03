import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ShortenUrlInput {
  @Field()
  url!: string;
}
