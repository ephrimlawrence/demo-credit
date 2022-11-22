import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from './signup.dto';

@Controller('signup')
export class SignupController {
    @Post()
    async create(@Body() dto: SignupDto) {
        console.log("working")

        return "working"
    }
}
