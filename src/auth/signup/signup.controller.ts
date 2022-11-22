import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from './signup.dto';
import * as bcrypt from 'bcrypt';
import { InjectKnex, Knex } from 'nestjs-knex';

const saltOrRounds = 10;

@Controller('signup')
export class SignupController {
    constructor(
        @InjectKnex() private readonly knex: Knex,
    ) { }

    @Post()
    async create(@Body() dto: SignupDto) {
        // Create new user
        const user = await this.knex('users')
            .insert({
                ...dto,
                password: await bcrypt.hash(dto.password, saltOrRounds),
            }) // Resolves to User | undefined

        console.log(user)

        return "working"
    }
}
