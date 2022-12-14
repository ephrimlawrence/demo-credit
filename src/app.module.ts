import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { RouterModule, Routes } from '@nestjs/core';
import { DepositsController } from './deposits/deposits.controller';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { WithdrawalsController } from './withdrawals/withdrawals.controller';
import { TransfersController } from './transfers/transfers.controller';

config();


const routes: Routes = [
  {
    path: '/api',
    children: [
      {
        path: '/auth', module: AuthModule
      }
    ]
  }
]

@Module({
  imports: [
    RouterModule.register(routes),

    KnexModule.forRoot({
      config: {
        client: 'mysql2',
        useNullAsDefault: true,
        connection: {
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT,
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: 'demo_credit',
        },
      },
    }),
    AuthModule,
  ],
  controllers: [DepositsController, AccountsController, WithdrawalsController, TransfersController],
  providers: [AppService, AccountsService],
})
export class AppModule { }
