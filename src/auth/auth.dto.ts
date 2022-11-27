import { ApiExtraModels, ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { User, UserDto } from "src/entities/user.entity";

@ApiExtraModels(User)
export class SignupDto extends User {
}

export class LoginDto extends PickType(SignupDto, ["email", "password"] as const) { }


@ApiExtraModels(UserDto)
export class LoginResponseDto extends UserDto {
    @ApiProperty({ description: "Bearer token that must be included in all subsequent request" })
    accessToken: string;
}
