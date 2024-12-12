import { Injectable } from '@nestjs/common';
import * as db from 'zapatos/db';
import {
  CreateExamWithParticipantsFormDto,
  ExamSQL,
  ExamSQLExtended,
  ExamWithGroupCountSQL,
  FindExamDTO,
} from './dto/exam.dto';
import pool from 'src/pgPool';
import { isAdmin } from 'src/utils';
import { StudentMailerService } from './mailer.service';
import { ExamChatService } from './exam_chat.service';
@Injectable()
export class ExamService {
  constructor(
    private readonly mailerService: StudentMailerService,
    private readonly examChatService: ExamChatService,
  ) {}
  async create(body: CreateExamWithParticipantsFormDto, req: any) {
    const { participants, ...exam } = body;
    const new_exam = {
      ...exam,
      created_by_id: req.user.user_id,
      start_at: new Date(exam.start_at),
    };
    const exams = await db.insert('exam', { ...new_exam, batch: '' }).run(pool);
    console.log(exams);
    const participants_with_exam_id = participants.map((participant) => ({
      ...participant,
      exam_id: exams.exam_id,
    }));
    await db.insert('exam_participant', participants_with_exam_id).run(pool);
    const email_chat_map = this.examChatService.generateChatKeyValuePair(
      await this.examChatService.generate_exam_chat(exams.exam_id),
    );
    console.log(email_chat_map);
    this.mailerService.triggerEmail(exams.exam_id, body, email_chat_map);
    return exams;
  }

  async find_all(req: any) {
    if (isAdmin(req.user)) {
      const exams = db.sql<ExamSQL, ExamWithGroupCountSQL[]>`SELECT
      ${'e'}.*,
      COUNT(DISTINCT ${'ep'}.${'participant_email'}) AS ${'raw_student_count'},
      COALESCE(SUM(${'sg'}.${'student_group_size'}), 0) AS ${'group_student_count'},
      COUNT(DISTINCT ${'ep'}.${'participant_email'}) + COALESCE(SUM(${'sg'}.${'student_group_size'}), 0) AS ${'total_student_count'}
      FROM
          ${'exam'} as ${'e'}
      LEFT JOIN ${'exam_participant'} as ${'ep'} ON ${'e'}.${'exam_id'} = ${'ep'}.${'exam_id'}
      LEFT JOIN (
          SELECT
              ${'gm'}.${'student_group_id'},
              COUNT(${'gm'}.${'student_email'}) AS ${'student_group_size'}
          FROM
              ${'group_membership'} as ${'gm'}
          GROUP BY
              ${'gm'}.${'student_group_id'}
      ) as ${'sg'} ON ${'ep'}.${'student_group_id'} = ${'sg'}.${'student_group_id'}
      GROUP BY
          ${'e'}.${'exam_id'}
      `.run(pool);
      return exams;
    }
    const exams = db.sql<ExamSQL, ExamWithGroupCountSQL[]>`SELECT
    ${'e'}.*,
    COUNT(DISTINCT ${'ep'}.${'participant_email'}) AS ${'raw_student_count'},
    COALESCE(SUM(${'sg'}.${'student_group_size'}), 0) AS ${'group_student_count'},
    COUNT(DISTINCT ${'ep'}.${'participant_email'}) + COALESCE(SUM(${'sg'}.${'student_group_size'}), 0) AS ${'total_student_count'}
    FROM
        ${'exam'} as ${'e'}
    LEFT JOIN ${'exam_participant'} as ${'ep'} ON ${'e'}.${'exam_id'} = ${'ep'}.${'exam_id'}
    LEFT JOIN (
        SELECT
            ${'gm'}.${'student_group_id'},
            COUNT(${'gm'}.${'student_email'}) AS ${'student_group_size'}
        FROM
            ${'group_membership'} as ${'gm'}
        GROUP BY
            ${'gm'}.${'student_group_id'}
    ) as ${'sg'} ON ${'ep'}.${'student_group_id'} = ${'sg'}.${'student_group_id'}
    WHERE ${'e'}.${'created_by_id'} = ${db.param(req.user.user_id)}
    GROUP BY
        ${'e'}.${'exam_id'}
    `.run(pool);
    return exams;
  }

  async find(req: any, body: FindExamDTO) {
    let start_at: Date | undefined;
    let new_body: any = { ...body };
    if (body.start_at) {
      start_at = new Date(body.start_at);
      new_body = { ...new_body, start_at };
    }
    const exam_find_id = await db
      .select('exam', new_body, {
        columns: ['exam_id'],
      })
      .run(pool);

    const exams = db.sql<ExamSQL, ExamWithGroupCountSQL[]>`SELECT
      ${'e'}.*,
      COUNT(DISTINCT ${'ep'}.${'participant_email'}) AS ${'raw_student_count'},
      COALESCE(SUM(${'sg'}.${'student_group_size'}), 0) AS ${'group_student_count'},
      COUNT(DISTINCT ${'ep'}.${'participant_email'}) + COALESCE(SUM(${'sg'}.${'student_group_size'}), 0) AS ${'total_student_count'}
      FROM
          ${'exam'} as ${'e'}
      LEFT JOIN ${'exam_participant'} as ${'ep'} ON ${'e'}.${'exam_id'} = ${'ep'}.${'exam_id'}
      LEFT JOIN (
          SELECT
              ${'gm'}.${'student_group_id'},
              COUNT(${'gm'}.${'student_email'}) AS ${'student_group_size'}
          FROM
              ${'group_membership'} as ${'gm'}
          GROUP BY
              ${'gm'}.${'student_group_id'}
      ) as ${'sg'} ON ${'ep'}.${'student_group_id'} = ${'sg'}.${'student_group_id'}
      WHERE ${'e'}.${'created_by_id'} = ${db.param(req.user.user_id)} AND ${'e'}.${'exam_id'} IN (${db.param(exam_find_id.map((e) => e.exam_id))})
      GROUP BY
          ${'e'}.${'exam_id'}
      `.run(pool);
    return exams;
  }

  async find_detailed(req: { user: { user_id: number } }, id: number) {
    const exams = await db.sql<ExamSQLExtended, ExamWithGroupCountSQL[]>`SELECT
    ${'e'}.*,
    ${'p'}.${'prompt'} AS ${'persona_prompt'},
    ${'p'}.${'category'} AS ${'persona_category'},
    ${'p'}.${'subcategory'} AS ${'persona_subcategory'},
    ${'p'}.${'title'} AS ${'persona_title'},
    jsonb_object_agg(${'sg'}.${'student_group_id'}, ${'sg'}.${'student_email'}) AS ${'student_groups'},
    sg.raw_students AS ${'others'},
    COUNT(DISTINCT ${'ep'}.${'participant_email'}) + COALESCE(SUM(${'sg'}.${'student_group_size'}), 0) AS ${'total_student_count'}
    FROM ${'exam'} as ${'e'}
    LEFT JOIN ${'persona'} as ${'p'} ON ${'e'}.${'persona_id'} = ${'p'}.${'persona_id'}
    LEFT JOIN ${'exam_participant'} as ${'ep'} ON ${'e'}.${'exam_id'} = ${'ep'}.${'exam_id'}
    LEFT JOIN (
        SELECT
            ${'gm'}.${'student_group_id'},
            COUNT(gm.student_email) AS student_count,
            jsonb_agg(${'gm'}.${'student_email'}) AS ${'student_email'}
        FROM
            ${'group_membership'} as ${'gm'}
      GROUP BY
            ${'gm'}.${'student_group_id'}
    ) AS ${'gm'} ON ${'ep'}.${'student_group_id'} = ${'gm'}.${'student_group_id'}
    LEFT JOIN (
        SELECT
            ${'ep'}.${'exam_id'},
            jsonb_agg(${'ep'}.${'participant_email'}) AS ${'raw_students'}
        FROM
            ${'exam_participant'} as ${'ep'}
        WHERE
            ${'ep'}.${'student_group_id'} IS NULL
        GROUP BY
            ${'ep'}.${'exam_id'}
    ) AS ${'sg'} ON ${'e'}.${'exam_id'} = ${'sg'}.${'exam_id'}
    WHERE ${'e'}.${'created_by_id'} = ${db.param(req.user.user_id)}
    GROUP BY ${'e'}.${'exam_id'}, ${'p'}.${'prompt'}, ${'p'}.${'category'}, ${'p'}.${'subcategory'}, ${'p'}.${'title'}
    `.run(pool);
    return exams;
  }

  async delete(req: { user: { user_id: number } }, body: { exam_id: number }) {
    const exams = await db
      .deletes('exam', {
        exam_id: body.exam_id,
      })
      .run(pool);
    return exams;
  }
}
