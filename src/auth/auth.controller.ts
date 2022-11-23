import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignupDto } from './auth.dto';

@Controller()
export class AuthController {
    constructor(
        private readonly service: AuthService,
    ) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return req.user;
    }


    @Post("signup")
    async create(@Body() dto: SignupDto) {
        return this.service.create(dto);
    }
}
