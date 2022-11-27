import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class Timestamps {
    @ApiProperty({
        description: "Unique id of the record",
        example: 1
    })
    id: number;

    @ApiProperty({
        description: "Date and time at which the record was created",
        example: "2022-11-27T08:26:28.395Z"
    })
    createdAt: Date;

    @ApiProperty({
        description: "Date and time at which the record was updated",
        example: "2022-11-27T08:26:28.395Z"
    })
    updatedAt: Date;
}

export class User extends Timestamps {
    @ApiProperty({
        description: "Email of the user",
        example: "jane@example.com"
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: "Account password",
        example: "password"
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({
        description: "The first name of the user",
        example: "Jane"
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    firstName: string;

    @ApiProperty({
        description: "The last name of the user",
        example: "Doe"
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    lastName: string;


    @ApiProperty({
        description: "Middle or other names of the user",
        example: "Wood"
    })
    @IsOptional()
    @IsString()
    otherNames?: string;

    @ApiProperty({
        description: "The next of kin of the user",
        example: "Jane Frank Mason"
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    nextOfKin: string;
}

export class UserDto extends OmitType(User, ["password"] as const) { }
