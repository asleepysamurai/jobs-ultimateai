import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulateRepliesTable1644759098265 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO replies (intent_name, text) VALUES
      ('Greeting', 'Reply for Greeting'),
      ('Goodbye', 'Reply for Goodbye'),
      ('Affirmative', 'Reply for Affirmative'),
      ('Negative', 'Reply for Negative'),
      ('Thank you', 'Reply for Thank you'),
      ('Are you a bot?', 'Reply for Are you a bot?'),
      ('I want to speak with a human', 'Reply for I want to speak with a human'),
      ('Login Problems', 'Reply for Login Problems'),
      ('Open or close account', 'Reply for Open or close account')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM replies');
  }
}
