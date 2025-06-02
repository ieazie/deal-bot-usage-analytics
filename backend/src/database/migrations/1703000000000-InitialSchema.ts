import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1703000000000 implements MigrationInterface {
  name = 'InitialSchema1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create conversations table
    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" character varying(255) NOT NULL,
        "started_at" TIMESTAMP NOT NULL,
        "ended_at" TIMESTAMP,
        "total_messages" integer NOT NULL DEFAULT '0',
        "satisfaction_score" numeric(3,2),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversations" PRIMARY KEY ("id")
      )
    `);

    // Create messages table
    await queryRunner.query(`
      CREATE TYPE "public"."messages_role_enum" AS ENUM('user', 'assistant')
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "role" "public"."messages_role_enum" NOT NULL,
        "content" text NOT NULL,
        "timestamp" TIMESTAMP NOT NULL,
        "response_time_ms" integer,
        "has_results" boolean NOT NULL DEFAULT false,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id")
      )
    `);

    // Create usage_metrics table
    await queryRunner.query(`
      CREATE TYPE "public"."usage_metrics_metric_type_enum" AS ENUM('daily_queries', 'weekly_queries', 'response_time', 'no_results')
    `);

    await queryRunner.query(`
      CREATE TABLE "usage_metrics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "date" date NOT NULL,
        "metric_type" "public"."usage_metrics_metric_type_enum" NOT NULL,
        "value" numeric(10,2) NOT NULL,
        "metadata" jsonb,
        CONSTRAINT "PK_usage_metrics" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "messages" 
      ADD CONSTRAINT "FK_messages_conversation" 
      FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE
    `);

    // Create indexes for conversations
    await queryRunner.query(`CREATE INDEX "IDX_conversations_user_id" ON "conversations" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_conversations_started_at" ON "conversations" ("started_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_conversations_satisfaction_score" ON "conversations" ("satisfaction_score")`);

    // Create indexes for messages
    await queryRunner.query(`CREATE INDEX "IDX_messages_conversation_id" ON "messages" ("conversation_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_messages_timestamp" ON "messages" ("timestamp")`);
    await queryRunner.query(`CREATE INDEX "IDX_messages_role" ON "messages" ("role")`);

    // Create indexes for usage_metrics
    await queryRunner.query(`CREATE INDEX "IDX_usage_metrics_date" ON "usage_metrics" ("date")`);
    await queryRunner.query(`CREATE INDEX "IDX_usage_metrics_metric_type" ON "usage_metrics" ("metric_type")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_usage_metrics_date_metric_type" ON "usage_metrics" ("date", "metric_type")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_usage_metrics_date_metric_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_usage_metrics_metric_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_usage_metrics_date"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_messages_role"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_messages_timestamp"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_messages_conversation_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_conversations_satisfaction_score"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_conversations_started_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_conversations_user_id"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_conversation"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "usage_metrics"`);
    await queryRunner.query(`DROP TYPE "public"."usage_metrics_metric_type_enum"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TYPE "public"."messages_role_enum"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
  }
} 