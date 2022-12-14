import { Body, Controller, Post, UseGuards, Request, ForbiddenException, Get, InternalServerErrorException } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { InjectKnex, Knex } from 'nestjs-knex';
import { AccountsService } from 'src/accounts/accounts.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.strategy';
import { User } from 'src/entities/user.entity';

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

@ApiTags("Withdrawals")
@ApiBearerAuth()
@Controller('api/withdrawals')
export class WithdrawalsController {
    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly accountService: AccountsService
    ) { }

    @ApiOperation({
        operationId: "Request Withdraw",
        description: "Withdraw an money from the user's account"
    })
    @ApiCreatedResponse({ type: WithdrawalDto })
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

        let id: number;
        try {
            await this.knex.transaction(async trx => {
                // TODO: user transaction
                [id] = await trx("withdrawals").insert({ accountId: account.id, amount: dto.amount });

                await this.accountService.decreaseBalance({ id: account.id, amount: dto.amount, knex: trx })
            });

            return await this.knex("withdrawals").where({ id: id?.toString() }).first()
        } catch (error) {
            console.error(error);

            throw new InternalServerErrorException("An error occurred while processing request. Contact customer support for assistance")
        }
    }

    @ApiOperation({
        operationId: "All Withdraws",
        description: "List of all withdrawals made by the user"
    })
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Request() req): Promise<WithdrawalDto[]> {
        const user = (req.user as User);
        const account = await this.accountService.findByUserId(user.id)

        const resp = await this.knex("withdrawals").where({ accountId: account.id });

        return resp;
    }
}
