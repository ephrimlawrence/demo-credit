import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { Timestamps } from "./user.entity";

export class TransferDto extends Timestamps {
    @ApiProperty({
        description: "The amount to be transferred into the user's account",
        example: 10000
    })
    @Type(() => Number)
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;

    @ApiProperty({
        description: "The account number which the amount is being transferred from",
        example: "ACCT00442"
    })
    @IsNotEmpty()
    @IsString()
    fromAccountId: number;

    @ApiProperty({
        description: "The account number which the amount is being transferred to",
        example: "ACCT00443"
    })
    @IsNotEmpty()
    @IsString()
    toAccountId: number;
}
