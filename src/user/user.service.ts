import { Injectable, NotFoundException } from '@nestjs/common';
import pool from 'src/pgPool';
import { Role } from 'src/role.enum';

import * as db from 'zapatos/db';
import type * as s from 'zapatos/schema';
import { User } from './data';
import { CreateTeacherDto } from './dto/teacher.dto';
const bcrypt = require('bcrypt');
@Injectable()
export class UserService {
  constructor() {}

  async getUser(email: string) {
    const user = await db.sql<s.user.SQL, s.user.Selectable[]>`
      SELECT * FROM ${'user'} WHERE ${{ email }} LIMIT 1
    `.run(pool);
    if (user.length === 0) {
      throw new NotFoundException('user not found');
    }
    const userData: User = {
      ...user[0],
      role: user[0].role as Role,
    };
    return userData;
  }

  //create teacher
  async createTeacher(body: CreateTeacherDto, req: any) {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(body.password, salt);
    const user = await db
      .insert('user', { ...body, role: Role.Teacher, password })
      .run(pool);
    return user;
  }

  async getTeachers() {
    const teacher = await db.sql<s.user.SQL, s.user.Selectable[]>`
      SELECT * FROM ${'user'} WHERE ${'role'} = ${db.param(Role.Teacher)}
    `.run(pool);
    return teacher;
  }
}
