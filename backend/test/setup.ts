import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

export let app: INestApplication;
export let dataSource: DataSource;

beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 
    'postgresql://analytics_user:analytics_pass@localhost:5432/dealbot_analytics_test';
  
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  dataSource = app.get(DataSource);
});

afterAll(async () => {
  if (dataSource) {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  }
  if (app) {
    await app.close();
  }
});

beforeEach(async () => {
  // Clean database before each test
  if (dataSource && dataSource.isInitialized) {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
}); 