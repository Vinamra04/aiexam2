import { Module } from '@nestjs/common';
import { StudentGroupController } from './student_group.controller';
import { StudentGroupService } from './student_group.service';

@Module({
  controllers: [StudentGroupController],
  providers: [StudentGroupService]
})
export class StudentGroupModule {}
