import { Body, Controller, Post, UseGuards, Request, ForbiddenException, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { InjectKnex, Knex } from 'nestjs-knex';
import { AccountsService } from 'src/accounts/accounts.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.strategy';
import { TransferDto } from 'src/entities/transfer.entity';
import { User, UserDto } from 'src/entities/user.entity';

class CreateTransferDto extends PickType(TransferDto, ["amount", "toAccountId"] as const) {
}


@ApiTags("Transfers")
@ApiBearerAuth()
@Controller('api/transfers')
export class TransfersController {
    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly accountService: AccountsService
    ) { }

    @ApiOperation({
        operationId: "Create Transfer",
        description: "Transfer money from one account to other another. <br><strong>NOTE:</strong> The authenticated user's account is used as the source account"
    })
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() dto: CreateTransferDto, @Request() req): Promise<TransferDto> {
        const user = (req.user as UserDto);
        const fromAccount = await this.accountService.findByUserId(user.id)


        if (fromAccount.balance == 0) {
            throw new ForbiddenException("Not enough balance in your account")
        }

        if ((fromAccount.balance - dto.amount) <= 0) {
            throw new ForbiddenException("Amount to transfer is more than account balance")
        }


        const toAccount = await this.accountService.findByAccountNo(dto.toAccountId.toString())

        // TODO: user transaction
        const [id] = await this.knex("transfers").insert({ from_account_id: fromAccount.id, amount: dto.amount, to_account_id: toAccount.id });

        // Decrease sender's account balance
        await this.accountService.decreaseBalance({ id: fromAccount.id, amount: dto.amount })

        // Increase receiver's account balance
        await this.accountService.increaseBalance({ id: toAccount.id, amount: dto.amount })

        // Fetch transfer record
        const transfer = await this.knex<TransferDto>("transfers").where({ id: id }).first();
        return transfer;
    }

    @ApiOperation({
        operationId: "All Transfers",
    })
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Request() req): Promise<TransferDto[]> {
        const user = (req.user as UserDto);
        const account = await this.accountService.findByUserId(user.id)

        const transfers = await this.knex<TransferDto>("transfers").orWhere({ fromAccountId: account.id }).orWhere({ toAccountId: account.id });

        return transfers;
    }
}
