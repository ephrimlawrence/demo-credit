import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { RouterModule, Routes } from '@nestjs/core';

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
          port: 3306,
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: 'demo_credit',
        },
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
