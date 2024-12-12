import {
  IsString,
  Length,
  IsISO8601,
  IsInt,
  Min,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional } from 'class-validator';
import type * as s from 'zapatos/schema';

export class ParticipantDto {
  @IsEmail()
  @IsOptional()
  participant_email?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  student_group_id?: number;
}

export class CreateExamWithParticipantsFormDto {
  @IsString()
  @Length(1)
  title: string;

  @IsString()
  @Length(1)
  description: string;

  @IsISO8601()
  start_at: string;

  @IsInt()
  duration: number;

  @IsInt()
  @Min(1)
  persona_id: number;

  @IsBoolean()
  status: boolean;

  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];
}
export type ExamWithGroupCountSQL = s.exam.Selectable & {
  raw_student_count: number;
  group_student_count: number;
  total_student_count: number;
};
export type ExamSQL =
  | s.exam.SQL
  | s.exam_participant.SQL
  | s.group_membership.SQL
  | 'ep'
  | 'e'
  | 'gm'
  | 'sg'
  | 'raw_student_count'
  | 'group_student_count'
  | 'total_student_count'
  | 'student_group_size';

export type ExamSQLExtended =
  | ExamSQL
  | 'p'
  | s.persona.SQL
  | s.student_group.SQL
  | 'persona_prompt'
  | 'persona_category'
  | 'persona_subcategory'
  | 'persona_title'
  | 'student_groups'
  | 'raw_students'
  | 'others';
export class FindExamDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISO8601()
  @IsOptional()
  start_at?: string;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsInt()
  @IsOptional()
  persona_id?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
// {
//   "user": "ipriyam26@gmail.com",
//   "start": "October 10th 2024, 8:18:00 pm",
//   "exam_id": 15,
//   "chat_id": "f0a9298a-5021-4360-bff9-c2ee4d38dfc8"
// }

// make a type to hold this json
export type encryptedData = {
  user: string;
  start: string;
  exam_id: number;
  chat_id: string;
};
