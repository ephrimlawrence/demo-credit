import { Body, Controller, Post, UseGuards, Request, Get, InternalServerErrorException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { InjectKnex, Knex } from 'nestjs-knex';
import { AccountsService } from 'src/accounts/accounts.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.strategy';
import { DepositDto } from 'src/entities/deposit.entity';
import { UserDto } from 'src/entities/user.entity';

class CreateDepositDto extends PickType(DepositDto, ["amount"] as const) {
}


@ApiTags("Deposits")
@ApiBearerAuth()
@Controller('api/deposits')
export class DepositsController {
    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly accountService: AccountsService
    ) { }

    @ApiOperation({
        operationId: "New Deposit",
        description: "Deposit money into the user's account"
    })
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() dto: CreateDepositDto, @Request() req): Promise<DepositDto> {
        const user = (req.user as UserDto);
        const account = await this.accountService.findByUserId(user.id)

        let id: number | undefined;

        try {
            await this.knex.transaction(async trx => {
                [id] = await trx("deposits").insert({ accountId: account.id, amount: dto.amount });

                await this.accountService.increaseBalance({ id: account.id, amount: dto.amount, knex: trx })
            });

            // Fetch deposit record
            const deposit = await this.knex<DepositDto>("deposits").where({ id: id }).first();

            return deposit;
        } catch (error) {
            console.error(error);

            throw new InternalServerErrorException("An error occurred while processing deposit. Contact customer support for assistance")
        }
    }

    @ApiOperation({
        operationId: "All Deposits",
        description: "List of deposits of the user's account"
    })
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Request() req): Promise<DepositDto[]> {
        const user = (req.user as UserDto);
        const account = await this.accountService.findByUserId(user.id)

        const deposits = await this.knex<DepositDto>("deposits").where({ accountId: account.id });

        return deposits
    }
}
