import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { isAdmin } from 'src/utils';
import { CreateTeacherDto } from './dto/teacher.dto';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly userService: UserService) {}
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() body: CreateTeacherDto) {
    if (!isAdmin(req.user)) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    return await this.userService.createTeacher(body, req);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async get(@Req() req) {
    return await this.userService.getUser(req.user.email);
  }

  @Get('findall')
  async getTeachers(@Req() req) {
    if (!isAdmin(req.user)) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    return await this.userService.getTeachers();
  }
}
