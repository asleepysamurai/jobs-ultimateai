import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRepliesTable1644758932842 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "replies" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "intent_name" varchar NOT NULL, "text" varchar NOT NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "replies"`);
  }
}
