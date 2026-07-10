import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PeopleModule } from './people/people.module';
import { CompaniesModule } from './companies/companies.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
// Módulos antigos aguardando migração para o novo schema (comentados p/ build passar):
// import { ProjectsModule } from './projects/projects.module';
// import { InvestmentsModule } from './investments/investments.module';
// import { ReturnsModule } from './returns/returns.module';
// import { DocumentsModule } from './documents/documents.module';
// import { InteractionsModule } from './interactions/interactions.module';
// import { DashboardModule } from './dashboard/dashboard.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PeopleModule,
    CompaniesModule,
    BankAccountsModule,
    // ProjectsModule,
    // InvestmentsModule,
    // ReturnsModule,
    // DocumentsModule,
    // InteractionsModule,
    // DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
