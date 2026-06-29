import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUrlsTable1700000000000 implements MigrationInterface {
  name = 'CreateUrlsTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "urls" (
        "id"          SERIAL       PRIMARY KEY,
        "originalUrl" TEXT         NOT NULL,
        "shortCode"   VARCHAR(6)   NOT NULL UNIQUE,
        "visits"      INTEGER      NOT NULL DEFAULT 0,
        "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "urls"`);
  }
}
