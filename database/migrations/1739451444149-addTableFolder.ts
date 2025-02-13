import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableFolder1739451444149 implements MigrationInterface {
    name = 'AddTableFolder1739451444149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "folder" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "parentId" uuid, CONSTRAINT "PK_6278a41a706740c94c02e288df8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "folder" ADD CONSTRAINT "FK_9ee3bd0f189fb242d488c0dfa39" FOREIGN KEY ("parentId") REFERENCES "folder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folder" DROP CONSTRAINT "FK_9ee3bd0f189fb242d488c0dfa39"`);
        await queryRunner.query(`DROP TABLE "folder"`);
    }

}
