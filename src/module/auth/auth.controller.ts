import { Controller, Post, Body, Request, UseGuards  } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { LocalAuthGuard } from "./guard/local-auth.guard";

@Controller('auth')
export class AuthController{
    constructor(
        private authService: AuthService,
    ) {}

    @Post('signup')
    signup(@Body() dto: AuthDto) { // extract data from the body of a HTTP request
        console.log({
            dto,
        })
        return this.authService.signup(dto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() req){
        return this.authService.login(req.user);
    }
}