import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { StudentMailerService } from './mailer.service';
import { ExamChatService } from './exam_chat.service';

@Module({
  controllers: [ExamController],
  providers: [ExamService, StudentMailerService, ExamChatService],
})
export class ExamModule {}
