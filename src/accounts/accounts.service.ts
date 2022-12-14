import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { Account } from 'src/entities/account.entity';

@Injectable()
export class AccountsService {
    constructor(
        @InjectKnex() private readonly knex: Knex,
    ) { }

    async findById(id: number): Promise<Account> {
        const data = await this.knex<Account>('accounts')
            .where('id', id)
            .first();

        if (data == null) {
            throw new NotFoundException("Oop! The account cannot be found")
        }

        return data;
    }

    async findByAccountNo(accountNo: string): Promise<Account> {
        const data = await this.knex<Account>('accounts')
            .where('accountNo', accountNo)
            .first();

        if (data == null) {
            throw new NotFoundException("Oop! The account cannot be found")
        }

        return data;
    }

    async findByUserId(id: number): Promise<Account> {
        const data = await this.knex<Account>('accounts')
            .where('userId', id)
            .first();

        if (data == null) {
            throw new NotFoundException("Oop! The user cannot be found")
        }

        return data;
    }

    async increaseBalance(opts: { id: number, amount: number, knex?: Knex }) {
        return await (opts.knex ?? this.knex)<Account>("accounts").where("id", opts.id).increment("balance", opts.amount);
    }

    async decreaseBalance(opts: { id: number, amount: number, knex?: Knex }) {
        return await (opts.knex ?? this.knex)<Account>("accounts").where("id", opts.id).decrement("balance", opts.amount);
    }
}
