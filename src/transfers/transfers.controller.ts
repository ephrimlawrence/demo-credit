import { Body, Controller, Post, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { InjectKnex, Knex } from 'nestjs-knex';
import { AccountsService } from 'src/accounts/accounts.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.strategy';
import { User, UserDto } from 'src/entities/user.entity';

class TransferDto {
    @ApiProperty({
        description: "The amount to be deposited into the user's account",
        example: 10000
    })
    @Type(() => Number)
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;

    @ApiProperty({
        description: "The account number which the amount is being transferred to",
        example: "ACCT00443"
    })
    @IsNotEmpty()
    @IsString()
    to: string;
}


@ApiBearerAuth()
@Controller('api/transfers')
export class TransfersController {
    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly accountService: AccountsService
    ) { }

    @ApiOperation({
        operationId: "Transfers",
        description: "Transfer money from one account to other another. <br><strong>NOTE:</strong> The authenticated user's account is used as the source account"
    })
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() dto: TransferDto, @Request() req) {
        const user = (req.user as UserDto);
        const fromAccount = await this.accountService.findByUserId(user.id)


        if (fromAccount.balance == 0) {
            throw new ForbiddenException("Not enough balance in your account")
        }

        if ((fromAccount.balance - dto.amount) <= 0) {
            throw new ForbiddenException("Amount to transfer is more than account balance")
        }


        const toAccount = await this.accountService.findByAccountNo(dto.to)

        // TODO: user transaction
        await this.knex("transfers").insert({ from_account_id: fromAccount.id, amount: dto.amount, to_account_id: toAccount.id });

        // Decrease sender's account balance
        await this.accountService.decreaseBalance({ id: fromAccount.id, amount: dto.amount })

        // Increase receiver's account balance
        await this.accountService.increaseBalance({ id: toAccount.id, amount: dto.amount })

        return { message: "Amount transferred successfully" }
    }
}
