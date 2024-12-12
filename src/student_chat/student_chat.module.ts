import { Module } from '@nestjs/common';
import { StudentChatController } from './student_chat.controller';
import { StudentChatService } from './student_chat.service';

@Module({
  controllers: [StudentChatController],
  providers: [StudentChatService],
})
export class StudentChatModule {}
