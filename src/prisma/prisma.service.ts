import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: mariadb.Pool;

  constructor() {
    const dbUrl = (process.env.DATABASE_URL || 'mysql://root:5826@localhost:3306/gimnasio').replace('mysql:', 'mariadb:');
    const pool = mariadb.createPool(dbUrl);
    const adapter = new PrismaMariaDb(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
