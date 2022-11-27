import { Body, Controller, Post, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { InjectKnex, Knex } from 'nestjs-knex';
import { AccountsService } from 'src/accounts/accounts.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.strategy';

class WithdrawalDto {
    @ApiProperty({
        description: "The amount to be withdrawn from the user's account",
        example: 10000
    })
    @Type(() => Number)
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;
}

@ApiBearerAuth()
@Controller('api/withdrawals')
export class WithdrawalsController {
    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly accountService: AccountsService
    ) { }

    @ApiOperation({
        operationId: "Withdraw",
        description: "Withdraw an money from the user's account"
    })
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() dto: WithdrawalDto, @Request() req) {
        const user = (req.user as User);
        const account = await this.accountService.findByUserId(user.id)

        if (account.balance == 0) {
            throw new ForbiddenException("Not enough balance in your account")
        }

        if ((account.balance - dto.amount) <= 0) {
            throw new ForbiddenException("Amount to withdraw is more than account balance")
        }

        // TODO: user transaction
        await this.knex("withdrawals").insert({ accountId: account.id, amount: dto.amount });

        await this.accountService.decreaseBalance({ id: account.id, amount: dto.amount })

        return { message: "Amount withdrawn successfully" }
    }
}
