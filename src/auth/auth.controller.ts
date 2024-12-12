import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticateDto } from './dto/authenticate.dto';
import { CreateAdminDto } from '../user/dto/admin.dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Res() res, @Body() body: AuthenticateDto) {
    try {
      const response = await this.authService.authenticate(body);
      return res.status(HttpStatus.OK).json({ response });
    } catch (e) {
      res.status(e.status).json({ message: e.message });
    }
  }

  @Post('register/admin')
  async register(@Body() body: CreateAdminDto) {
    const response = await this.authService.register_admin(body);
    return response;
  }
  @Post('deregister/admin')
  async delete(@Body() body: { id: number }) {
    const response = await this.authService.delete_admin(body.id);
    return response;
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  profile(@Req() req) {
    return req.user;
  }
}
