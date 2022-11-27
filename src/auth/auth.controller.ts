import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth.dto';
import { ApiCreatedResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

class LoginResponseDto {
    @ApiProperty({ description: "Bearer token that must be inlcuded in all subsequent request" })
    accessToken: string;
}

@ApiTags("Authentication")
@Controller()
export class AuthController {
    constructor(
        private readonly service: AuthService,
    ) { }

    @ApiOperation({
        operationId: "Login",
        description: "Login to the user's account. Response includes access token which must be added to all request"
    })
    @ApiCreatedResponse({
        type: LoginResponseDto,
        description: "User authenticated successfully"
    })
    @Post('login')
    async login(
        @Body() dto: LoginDto
    ) {
        return this.service.login(dto);
    }


    @ApiOperation({
        operationId: "Signup",
        description: "Create new account for a customer"
    })
    @Post("signup")
    async create(@Body() dto: SignupDto) {
        return this.service.create(dto);
    }
}
