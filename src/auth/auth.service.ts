import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { LoginDto, SignupDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { validate } from 'class-validator';
import { plainToClass, plainToInstance } from 'class-transformer';
import { User, UserDto } from 'src/entities/user.entity';


const saltOrRounds = 10;


@Injectable()
export class AuthService {
    constructor(
        @InjectKnex() private readonly knex: Knex,
        private jwtService: JwtService
    ) { }

    async create(dto: SignupDto) {
        // TODO: check for email conflicts
        // TODO: put logic in a transaction

        // Create new user
        const user = await this.knex('users')
            .insert({
                ...dto,
                password: await bcrypt.hash(dto.password, saltOrRounds),
            })

        // Create new account for the user
        const userId = user[0];
        await this.knex('accounts')
            .insert({
                currency: "₦",
                userId: userId,
                accountNo: `ACCT${userId.toString().padStart(4, "0")}`,
                balance: 0,
            })

        return this.findById(userId);
    }

    async findById(id: number): Promise<UserDto> {
        const user = await this.knex<UserDto>('users')
            .where('id', id)
            .first();

        if (user == null) {
            throw new NotFoundException("Oop! The user cannot be found")
        }

        return user;
    }


    async validateUser(dto: LoginDto): Promise<any> {
        // const data = await validate(plainToInstance(LoginDto, { email, password }))
        // console.log(data);

        const user = await this.knex<User>('users')
            .where('email', dto.email)
            .first();

        if (user && bcrypt.compareSync(dto.password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(dto: LoginDto) {
        const user = await this.validateUser(dto);

        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

}
