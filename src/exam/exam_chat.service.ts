import { Injectable } from '@nestjs/common';
import { StudentMailerService } from './mailer.service';
import * as db from 'zapatos/db';
import pool from 'src/pgPool';
import { exam_chat } from 'zapatos/schema';
@Injectable()
export class ExamChatService {
  constructor(private readonly studentMailService: StudentMailerService) {}

  async generate_exam_chat(exam_id: number) {
    const { groups_students_emails, individual_mails } =
      await this.studentMailService.findStudentEmails(exam_id);

    const datas = groups_students_emails.map((group_emails) => {
      return {
        participant_email: group_emails.student_email,
        student_group_id: group_emails.student_group_id,
        status: false,
        exam_id: exam_id,
      };
    });
    const dds = individual_mails.map((mail) => {
      return {
        participant_email: mail,
        student_group_id: null,
        status: false,
        exam_id: exam_id,
      };
    });
    return await db.insert('exam_chat', [...datas, ...dds]).run(pool);
  }

  generateChatKeyValuePair(chats: exam_chat.JSONSelectable[]) {
    const chatsWithKeyValuePair = new Map<string, string>();
    chats.forEach((chat) => {
      chatsWithKeyValuePair.set(chat.participant_email, chat.chat_id);
    });
    return chatsWithKeyValuePair;
  }
}
