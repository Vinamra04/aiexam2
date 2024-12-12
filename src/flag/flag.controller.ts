import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FlagService } from './flag.service';
import {
  AssignFlagRequestDto,
  FindFlagRequestDto,
  NewFlagRequestDto,
} from './dto/flag.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('flag')
export class FlagController {
  constructor(private readonly flagService: FlagService) {}

  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() body: NewFlagRequestDto) {
    return await this.flagService.create(body, req);
  }

  @Get('findall')
  @UseGuards(JwtAuthGuard)
  async findall() {
    return await this.flagService.find_all();
  }
  @Post('find')
  @UseGuards(JwtAuthGuard)
  async find(@Req() req: any, @Body() body: FindFlagRequestDto) {
    return await this.flagService.find(body);
  }
  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: any, @Body() body: FindFlagRequestDto) {
    return await this.flagService.delete(body);
  }
  @Post('assign')
  @UseGuards(JwtAuthGuard)
  async assign(@Req() req: any, @Body() body: AssignFlagRequestDto) {
    return await this.flagService.assing_flags(body);
  }
}
