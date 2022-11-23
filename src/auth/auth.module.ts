import { Module } from '@nestjs/common';
import { SignupController } from './signup/signup.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [SignupController],
  providers: [AuthService]
})
export class AuthModule { }
