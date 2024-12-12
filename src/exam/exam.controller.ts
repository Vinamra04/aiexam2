import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateExamWithParticipantsFormDto, FindExamDTO } from './dto/exam.dto';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() body: CreateExamWithParticipantsFormDto, @Req() req) {
    return await this.examService.create(body, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('find')
  async find(@Body() body: FindExamDTO, @Req() req) {
    return await this.examService.find(req, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('find_detailed')
  async find_detailed(@Body() body: any, @Req() req) {
    return await this.examService.find_detailed(req, 1);
  }

  @UseGuards(JwtAuthGuard)
  @Get('find_all')
  async find_all(@Req() req) {
    return await this.examService.find_all(req);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async delete(@Req() req, @Body() body: { exam_id: number }) {
    return await this.examService.delete(req, body);
  }
}
