import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { SignupDto } from './auth.dto';
import * as bcrypt from 'bcrypt';


const saltOrRounds = 10;
@Injectable()
export class AuthService {
    constructor(
        @InjectKnex() private readonly knex: Knex,
    ) { }

    async create(dto: SignupDto) {
        // Create new user
        const user = await this.knex('users')
            .insert({
                ...dto,
                password: await bcrypt.hash(dto.password, saltOrRounds),
            }) // Resolves to User | undefined

        return this.findById(user[0]);
    }

    async findById(id: number): Promise<User> {
        const user = await this.knex<User>('users')
            .where('id', id)
            .first();

        if (user == null) {
            throw new BadRequestException("Oop! The user cannot be found")
        }

        delete user.password;

        return user;
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.knex<User>('users')
            .where('email', email)
            .first();

            if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

}
