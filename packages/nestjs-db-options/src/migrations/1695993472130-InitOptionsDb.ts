import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitOptionsDb1695993472130 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`options\` (\`id\` int NOT NULL AUTO_INCREMENT, \`key\` varchar(255) NOT NULL, \`value\` text NOT NULL, \`format\` varchar(255) NOT NULL DEFAULT 'string', UNIQUE INDEX \`IDX_e19ad52a146d46abb337f4346f\` (\`key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_e19ad52a146d46abb337f4346f\` ON \`options\``);
    await queryRunner.query(`DROP TABLE \`options\``);
  }
}
