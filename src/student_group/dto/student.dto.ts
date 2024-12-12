import { IsArray, IsString, IsNumber } from 'class-validator';

export class StudentGroup {
  @IsArray()
  student_email: string[];

  @IsString()
  group_name: string;
}
export class UpdateStudentGroup {
  @IsNumber()
  student_group_id: number;
  @IsArray()
  student_email: string[];
}
