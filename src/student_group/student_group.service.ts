import { Injectable } from '@nestjs/common';
import pool from 'src/pgPool';
import * as db from 'zapatos/db';
import { StudentGroup } from './dto/student.dto';
import type * as s from 'zapatos/schema';
import { User } from 'src/user/data';
import { isAdmin } from 'src/utils';
@Injectable()
export class StudentGroupService {
  async getAll(req: { user: User }) {
    if (isAdmin(req.user)) {
      const student_groups = await db.sql<
        s.student_group.SQL,
        s.student_group.Selectable[]
      >`
        SELECT * FROM ${'student_group'}
      `.run(pool);
      return student_groups;
    }
    const student_groups = await db.sql<
      s.student_group.SQL,
      s.student_group.Selectable[]
    >`
      SELECT * FROM ${'student_group'} WHERE ${'created_by_id'} = ${db.param(req.user.user_id)}
    `.run(pool);
    return student_groups;
  }
  async create(body: StudentGroup, req: { user: { user_id: number } }) {
    return await db.transaction(
      pool,
      db.IsolationLevel.Serializable,
      async (txnClient) => {
        const student_group = await db
          .insert('student_group', {
            student_group_name: body.group_name,
            created_by_id: req.user.user_id,
          })
          .run(txnClient);
        const group_membership = body.student_email.map((student_email) => ({
          student_email,
          student_group_id: student_group.student_group_id,
        }));
        await db.insert('group_membership', group_membership).run(txnClient);
        return student_group;
      },
    );
  }

  async update(body: { student_group_id: number; student_email: string[] }) {
    return await db.transaction(
      pool,
      db.IsolationLevel.Serializable,
      async (txnClient) => {
        //delete all the memberships of the group
        await db
          .deletes('group_membership', {
            student_group_id: body.student_group_id,
          })
          .run(txnClient);
        //insert the new memberships
        await db
          .insert(
            'group_membership',
            body.student_email.map((student_email) => ({
              student_email,
              student_group_id: body.student_group_id,
            })),
          )
          .run(txnClient);
        return true;
      },
    );
  }
  async delete(body: { student_group_id: number }) {
    return await db.transaction(
      pool,
      db.IsolationLevel.Serializable,
      async (txnClient) => {
        //delete all the memberships of the group
        await db
          .deletes('group_membership', {
            student_group_id: body.student_group_id,
          })
          .run(txnClient);
        //delete the group
        await db
          .deletes('student_group', {
            student_group_id: body.student_group_id,
          })
          .run(txnClient);
        return true;
      },
    );
  }
}
