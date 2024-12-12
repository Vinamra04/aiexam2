import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import pool from 'src/pgPool';
import * as db from 'zapatos/db';
import type * as s from 'zapatos/schema';
import {
  CreateExamWithParticipantsFormDto,
  encryptedData,
} from './dto/exam.dto';
import { encrypt } from 'src/utils';
import { SentMessageInfo } from 'nodemailer';
import * as moment from 'moment';
type GroupSQL =
  | s.student_group.Selectable
  | s.student_group.SQL
  | s.exam_participant.SQL
  | s.group_membership.SQL
  | s.exam.SQL;
@Injectable()
export class StudentMailerService {
  constructor(private readonly mailerService: MailerService) {}
  async triggerEmail(
    exam_id: number,
    exam_form: CreateExamWithParticipantsFormDto,
    email_chat_map: Map<string, string>,
  ) {
    const { mails } = await this.findStudentEmails(exam_id);
    const extra_data = await this.findRelevantData(exam_id);
    const data = {
      teacher_name: extra_data.teacher_name,
      subject: extra_data.subject,
      duration: exam_form.duration,
      start_at: moment(exam_form.start_at).format('MMMM Do YYYY, h:mm:ss a'),
      description: exam_form.description,
      exam_title: exam_form.title,
    };

    const mail_promises = mails.map(async (mail) => {
      const unique_link = await this.generateValidLink(
        mail,
        data.start_at,
        exam_id,
        email_chat_map.get(mail),
      );
      const user_data = {
        ...data,
        unique_link,
      };
      const response: SentMessageInfo = await this.mailerService.sendMail({
        from: 'aiexam@gmail.com',
        to: mail,
        subject: 'TheoDev: New Exam Scheduled',
        template: process.cwd() + '/templates/student_mail.hbs',
        context: user_data,
      });
      return response;
    });
    const responses = await Promise.allSettled(mail_promises);
    return responses;
  }

  async generateValidLink(
    mail: string,
    start: string,
    exam_id: number,
    chat_id: string,
  ) {
    const dataToBeEncoded: encryptedData = {
      user: mail,
      start: start,
      exam_id: exam_id,
      chat_id: chat_id,
    };
    const encodedData = encrypt(JSON.stringify(dataToBeEncoded));
    const unique_link = `https://student.aiexam.com/exam/data=${encodeURIComponent(encodedData)}`;
    return unique_link;
  }

  async findRelevantData(exam_id: number) {
    const data: {
      teacher_name: string;
      subject: string;
    } = await db.sql<
      GroupSQL | s.persona.SQL | s.user.SQL | 'teacher_name' | 'subject',
      any[]
    >`SELECT ${'user'}.${'name'} as ${'teacher_name'}, ${'persona'}.${'title'} as ${'subject'} FROM ${'exam'}
    INNER JOIN ${'persona'} on ${'exam'}.${'persona_id'} = ${'persona'}.${'persona_id'}
    INNER JOIN ${'user'} on ${'exam'}.${'created_by_id'} = ${'user'}.${'user_id'}
    WHERE ${'exam'}.${'exam_id'} = ${db.param(exam_id)}
    `
      .run(pool)
      .then((res) => res[0]);
    return data;
  }
  async findStudentEmails(exam_id: number) {
    const groups_students_emails = await db.sql<
      GroupSQL,
      s.group_membership.OnlyCols<['student_email', 'student_group_id']>[]
    >`SELECT ${'group_membership'}.${'student_email'}, ${'group_membership'}.${'student_group_id'}  FROM ${'exam'}
    INNER JOIN ${'exam_participant'} ON ${'exam'}.${'exam_id'} = ${'exam_participant'}.${'exam_id'}
    INNER JOIN ${'group_membership'} ON ${'exam_participant'}.${'student_group_id'} = ${'group_membership'}.${'student_group_id'}
    WHERE ${'exam'}.${'exam_id'} = ${db.param(exam_id)}
    `.run(pool);

    const individual_students_emails = await db.sql<
      GroupSQL,
      s.exam_participant.OnlyCols<['participant_email']>[]
    >`SELECT ${'exam_participant'}.${'participant_email'}  FROM ${'exam'}
    INNER JOIN ${'exam_participant'} ON ${'exam'}.${'exam_id'} = ${'exam_participant'}.${'exam_id'}
    WHERE ${'exam'}.${'exam_id'} = ${db.param(exam_id)}
    `.run(pool);
    const group_mails = groups_students_emails.map((e) => e.student_email);

    const individual_mails = individual_students_emails.map(
      (e) => e.participant_email,
    );
    const mails = [...group_mails, ...individual_mails];
    return { mails, groups_students_emails, individual_mails };
  }
}
