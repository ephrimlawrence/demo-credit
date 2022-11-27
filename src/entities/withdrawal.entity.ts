import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { Timestamps } from "./user.entity";

export class WithdrawalDto extends Timestamps {
    @ApiProperty({
        description: "Amount that was withdrawn",
        example: 1000
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount;

    @ApiProperty({
        description: "Id of the account which the money was withdrawn from",
        example: "ACT1000"
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    accountId: number;
}
