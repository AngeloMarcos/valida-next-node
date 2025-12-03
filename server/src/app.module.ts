import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BankIntegrationModule } from './bank-integration/bank-integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BankIntegrationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
