import { Injectable } from '@nestjs/common';
import {
  AssignPersonaRequestDto,
  FindPersonaRequestDto,
  NewPersonaRequestDto,
} from './dto/persona.dto';
import type * as s from 'zapatos/schema';
import * as db from 'zapatos/db';
import pool from 'src/pgPool';

import { User } from 'src/user/data';
import { isAdmin } from 'src/utils';
export type PersonaSQL =
  | s.persona.SQL
  | s.persona_flag.SQL
  | s.persona_access.SQL
  | s.flag.SQL
  | 'flag_names'
  | 'pf'
  | 'f'
  | 'p'
  | 'pa';

export type PersonaWithFlagNamesSQL = s.persona.Selectable & {
  flag_names: string[];
};

@Injectable()
export class PersonaService {
  create(body: NewPersonaRequestDto, req: any) {
    const persona = db
      .insert('persona', { ...body, created_by_id: req.user.user_id })
      .run(pool);
    return persona;
  }
  delete(req: { user: User }, body: FindPersonaRequestDto) {
    const persona = db.deletes('persona', body).run(pool);
    return persona;
  }
  find(req: { user: User }, body: FindPersonaRequestDto) {
    const persona = db.select('persona', body).run(pool);
    return persona;
  }

  findall(req: { user: User }): Promise<PersonaWithFlagNamesSQL[]> {
    if (isAdmin(req.user)) {
      const persona = db.sql<PersonaSQL, PersonaWithFlagNamesSQL[]>`SELECT
      ${'p'}.*,
      COALESCE(array_agg(${'f'}.${'flag_name'}) FILTER (WHERE ${'f'}.${'flag_name'} IS NOT NULL), '{}') AS ${'flag_names'} 
      FROM ${'persona'} as ${'p'}
      LEFT JOIN ${'persona_flag'} as ${'pf'} ON ${'p'}.${'persona_id'} = ${'pf'}.${'persona_id'}
      LEFT JOIN ${'flag'} as ${'f'} ON ${'pf'}.${'flag_id'} = ${'f'}.${'flag_id'}
      WHERE ${'p'}.${'status'} = TRUE
      GROUP BY ${'p'}.${'persona_id'}
      `.run(pool);

      return persona;
    }
    const persona = db.sql<PersonaSQL, PersonaWithFlagNamesSQL[]>`SELECT
      ${'p'}.*,
      COALESCE(array_agg(${'f'}.${'flag_name'}) FILTER (WHERE ${'f'}.${'flag_name'} IS NOT NULL), '{}') AS ${'flag_names'} 
      FROM ${'persona'} as ${'p'}
      LEFT JOIN ${'persona_flag'} as ${'pf'} ON ${'p'}.${'persona_id'} = ${'pf'}.${'persona_id'}
      LEFT JOIN ${'flag'} as ${'f'} ON ${'pf'}.${'flag_id'} = ${'f'}.${'flag_id'}
      LEFT JOIN ${'persona_access'} as ${'pa'} ON ${'p'}.${'persona_id'} = ${'pa'}.${'persona_id'}
      WHERE ${'p'}.${'status'} = TRUE AND ${'pa'}.${'user_id'} = ${db.param(req.user.user_id)}
      GROUP BY ${'p'}.${'persona_id'}
      `.run(pool);
    return persona;
  }
  persona_access(req: { user: User }, body: AssignPersonaRequestDto) {
    const persona_access = db.insert('persona_access', body).run(pool);
    return persona_access;
  }
  persona_remove_access(req: { user: User }, body: AssignPersonaRequestDto) {
    const persona_access = db.deletes('persona_access', body).run(pool);
    return persona_access;
  }
}
