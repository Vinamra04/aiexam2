import { Injectable } from '@nestjs/common';
import {
  AssignFlagRequestDto,
  FindFlagRequestDto,
  NewFlagRequestDto,
} from './dto/flag.dto';
import * as db from 'zapatos/db';
import pool from 'src/pgPool';
@Injectable()
export class FlagService {
  create(body: NewFlagRequestDto, req: { user: { user_id: number } }) {
    const flags = body.flag_name.map((flag_name) => ({
      flag_name,
      status: body.status,
      created_by_id: req.user.user_id,
    }));
    const flag = db.insert('flag', flags).run(pool);
    return flag;
  }

  find_all() {
    const flags = db.select('flag', { status: true }).run(pool);
    return flags;
  }

  find(body: FindFlagRequestDto) {
    const flags = db.select('flag', body).run(pool);
    return flags;
  }

  delete(body: FindFlagRequestDto) {
    const flags = db.deletes('flag', body).run(pool);
    return flags;
  }
  assing_flags(body: AssignFlagRequestDto) {
    const flag_data = body.flag_ids.map((flag_id) => ({
      flag_id,
      persona_id: body.persona_id,
    }));
    const flags = db.insert('persona_flag', flag_data).run(pool);
    return flags;
  }
}
