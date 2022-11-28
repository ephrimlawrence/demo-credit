import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { LoginDto, SignupDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDto } from 'src/entities/user.entity';


const saltOrRounds = 10;


@Injectable()
export class AuthService {
    constructor(
        @InjectKnex() private readonly knex: Knex,
        private jwtService: JwtService
    ) { }

    async create(dto: SignupDto) {
        const existing = await this.knex('users')
            .where({ email: dto.email }).first();

        if (existing != null) {
            throw new ConflictException("Email already exists")
        };

        let userId: number | undefined,
            accountId: number;
        try {
            await this.knex.transaction(async trx => {
                // Create new user
                [userId] = await trx('users').insert({
                    ...dto,
                    password: await bcrypt.hash(dto.password, saltOrRounds),
                });

                // Create new account for the user
                [accountId] = await trx('accounts')
                    .insert({
                        currency: "₦",
                        userId: userId,
                        accountNo: `ACCT${userId.toString().padStart(4, "0")}`,
                        balance: 0,
                    })
            });

            return { ...this.findById(userId), accountId }
        } catch (error) {
            console.error(error);

            throw new InternalServerErrorException("An error occurred while processing request. Contact customer support for assistance")
        }
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

        throw new UnauthorizedException("Invalid email or password");
    }

    async login(dto: LoginDto) {
        const user = await this.validateUser(dto);

        const payload = { email: user.email, sub: user.id };
        return {
            ...user,
            accessToken: this.jwtService.sign(payload),
        };
    }

}
