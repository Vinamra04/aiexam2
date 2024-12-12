import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StudentGroupService } from './student_group.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { StudentGroup, UpdateStudentGroup } from './dto/student.dto';

@Controller('student-group')
export class StudentGroupController {
  constructor(private readonly studentGroupService: StudentGroupService) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(@Req() req) {
    return await this.studentGroupService.getAll(req);
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: StudentGroup,
    @Req() req: { user: { user_id: number } },
  ) {
    return await this.studentGroupService.create(body, req);
  }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  async update(@Body() body: UpdateStudentGroup) {
    return await this.studentGroupService.update(body);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async delete(@Body() body: { student_group_id: number }) {
    return await this.studentGroupService.delete(body);
  }
}
