import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { InjectKnex, Knex } from 'nestjs-knex';
import { AccountsService } from 'src/accounts/accounts.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.strategy';

class DepositDto {
    @ApiProperty({
        description: "The amount to be deposited into the user's account",
        example: 10000
    })
    @Type(() => Number)
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;
}


@ApiBearerAuth()
@Controller('api/deposits')
export class DepositsController {
    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly accountService: AccountsService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() dto: DepositDto, @Request() req) {
        const user = (req.user as User);
        const account = await this.accountService.findByUserId(user.id)

        // TODO: user transaction
        await this.knex("deposits").insert({ accountId: account.id, amount: dto.amount });
        await this.knex<Account>("accounts").where("id", account.id).increment("balance", dto.amount);

        return { message: "Amount deposited into account successfully" }
    }
}
