import { DataSource, QueryRunner } from 'typeorm';
import { execSync } from 'child_process';
import { Url } from '../src/url-shorten/entities/url.entity';
import { UrlShortenService } from '../src/url-shorten/url-shorten.service';
import { NotFoundException } from '@nestjs/common';

const DB_CONFIG = {
  type: 'postgres' as const,
  host: 'localhost',
  port: 5434,
  username: 'postgres',
  password: 'postgres',
  database: 'url_shortener_test',
  entities: [Url],
};

let dataSource: DataSource;
let queryRunner: QueryRunner;
let service: UrlShortenService;

function startContainer() {
  execSync('docker compose -f docker-compose-test.yml up -d', {
    stdio: 'inherit',
  });
}

function waitForPostgres(maxRetries = 30, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      execSync(
        `docker compose -f docker-compose-test.yml exec -T postgres-test pg_isready -U postgres`,
        { stdio: 'ignore' },
      );
      return;
    } catch {
      execSync(`sleep ${delayMs / 1000}`);
    }
  }
  throw new Error('PostgreSQL did not become ready in time');
}

function stopContainer() {
  execSync('docker compose -f docker-compose-test.yml down -v', {
    stdio: 'inherit',
  });
}

beforeAll(async () => {
  startContainer();
  waitForPostgres();

  dataSource = new DataSource(DB_CONFIG);
  await dataSource.initialize();

  queryRunner = dataSource.createQueryRunner();
  await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await queryRunner.query(`
    CREATE TABLE IF NOT EXISTS "urls" (
      "id"          SERIAL       PRIMARY KEY,
      "originalUrl" TEXT         NOT NULL,
      "shortCode"   VARCHAR(6)   NOT NULL UNIQUE,
      "visits"      INTEGER      NOT NULL DEFAULT 0,
      "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT now()
    )
  `);

  const repo = dataSource.getRepository(Url);
  service = new UrlShortenService(repo);
});

afterAll(async () => {
  await queryRunner?.query(`DROP TABLE IF EXISTS "urls"`);
  await queryRunner?.release();
  await dataSource?.destroy();
  stopContainer();
});

beforeEach(async () => {
  await queryRunner.query(`TRUNCATE TABLE "urls" RESTART IDENTITY`);
});

describe('UrlShortenService', () => {
  describe('create()', () => {
    it('should create a new short url', async () => {
      const result = await service.create('https://example.com');

      expect(result).toBeDefined();
      expect(result.originalUrl).toBe('https://example.com');
      expect(result.shortCode).toHaveLength(6);
      expect(result.visits).toBe(0);
      expect(result.id).toBeGreaterThan(0);
    });

    it('should generate unique 6-char codes', async () => {
      const a = await service.create('https://example.com/1');
      const b = await service.create('https://example.com/2');

      expect(a.shortCode).toHaveLength(6);
      expect(b.shortCode).toHaveLength(6);
      expect(a.shortCode).not.toBe(b.shortCode);
    });

    it('should return existing url if same original url is submitted twice', async () => {
      const first = await service.create('https://example.com/dup');
      const second = await service.create('https://example.com/dup');

      expect(first.id).toBe(second.id);
      expect(first.shortCode).toBe(second.shortCode);
    });

    it('should store different urls with different codes', async () => {
      const a = await service.create('https://example.com/a');
      const b = await service.create('https://example.com/b');

      expect(a.id).not.toBe(b.id);
    });
  });

  describe('findByCode()', () => {
    it('should find url by short code', async () => {
      const created = await service.create('https://example.com/find');
      const found = await service.findByCode(created.shortCode);

      expect(found.id).toBe(created.id);
      expect(found.originalUrl).toBe('https://example.com/find');
    });

    it('should throw NotFoundException for non-existent code', async () => {
      await expect(service.findByCode('ZZZZZZ')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for empty string', async () => {
      await expect(service.findByCode('')).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementVisits()', () => {
    it('should increment visits from 0 to 1', async () => {
      const created = await service.create('https://example.com/visit');
      const updated = await service.incrementVisits(created.shortCode);

      expect(updated.visits).toBe(1);
    });

    it('should increment visits multiple times', async () => {
      const created = await service.create('https://example.com/multi');

      await service.incrementVisits(created.shortCode);
      await service.incrementVisits(created.shortCode);
      const result = await service.incrementVisits(created.shortCode);

      expect(result.visits).toBe(3);
    });

    it('should throw NotFoundException for non-existent code', async () => {
      await expect(service.incrementVisits('NOEXIST')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should persist visit count across reads', async () => {
      const created = await service.create('https://example.com/persist');

      await service.incrementVisits(created.shortCode);
      await service.incrementVisits(created.shortCode);

      const stats = await service.getStats(created.shortCode);
      expect(stats.visits).toBe(2);
    });
  });

  describe('getStats()', () => {
    it('should return url stats with 0 visits initially', async () => {
      const created = await service.create('https://example.com/stats');
      const stats = await service.getStats(created.shortCode);

      expect(stats.shortCode).toBe(created.shortCode);
      expect(stats.originalUrl).toBe('https://example.com/stats');
      expect(stats.visits).toBe(0);
      expect(stats.createdAt).toBeDefined();
    });

    it('should reflect incremented visits', async () => {
      const created = await service.create('https://example.com/stats2');

      await service.incrementVisits(created.shortCode);
      await service.incrementVisits(created.shortCode);
      await service.incrementVisits(created.shortCode);

      const stats = await service.getStats(created.shortCode);
      expect(stats.visits).toBe(3);
    });

    it('should throw NotFoundException for non-existent code', async () => {
      await expect(service.getStats('NOPE')).rejects.toThrow(NotFoundException);
    });

    it('should return correct createdAt', async () => {
      const created = await service.create('https://example.com/time');

      const stats = await service.getStats(created.shortCode);
      expect(stats.createdAt).toBeInstanceOf(Date);
      expect(stats.createdAt.getTime()).not.toBeNaN();
    });
  });
});
