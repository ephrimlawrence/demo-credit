import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { SignupDto } from './signup.dto';

@Controller('signup')
export class SignupController {
    constructor(
        private readonly service: AuthService,
    ) { }

    @Post()
    async create(@Body() dto: SignupDto) {
        return this.service.create(dto);
    }
}
