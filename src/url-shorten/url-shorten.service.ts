import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Url } from './entities/url.entity';

@Injectable()
export class UrlShortenService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepo: Repository<Url>,
  ) {}

  async create(originalUrl: string): Promise<Url> {
    const existing = await this.urlRepo.findOne({ where: { originalUrl } });
    if (existing) return existing;

    const shortCode = this.generateCode();
    const url = this.urlRepo.create({ originalUrl, shortCode });
    return this.urlRepo.save(url);
  }

  async findByCode(shortCode: string): Promise<Url> {
    const url = await this.urlRepo.findOne({ where: { shortCode } });
    if (!url)
      throw new NotFoundException(`Short code "${shortCode}" not found`);
    return url;
  }

  async incrementVisits(shortCode: string): Promise<Url> {
    const url = await this.findByCode(shortCode);
    url.visits += 1;
    return this.urlRepo.save(url);
  }

  async getStats(shortCode: string): Promise<Url> {
    return this.findByCode(shortCode);
  }

  private generateCode(): string {
    const Alphabet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const Code_length = 6;
    const bytes = randomBytes(Code_length);
    let code = '';

    for (let i = 0; i < Code_length; i++) {
      code += Alphabet[bytes[i] % Alphabet.length];
    }
    return code;
  }
}
