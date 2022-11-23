import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class SignupDto {
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
        description: "First name of the user",
        example: "Jane"
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    firstName: string;

    @ApiProperty({
        description: "Last name of the user",
        example: "Doe"
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    lastName: string;

    @ApiProperty({
        description: "Middle or other names of the user",
        example: "Wood-Blankson"
    })
    @IsOptional()
    @IsString()
    otherNames?: string;

    @ApiProperty({
        description: "User's next of kin full name",
        example: "Jane Wood"
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    nextOfKin: string;
}
