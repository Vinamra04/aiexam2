import { Role } from 'src/role.enum';
import type * as s from 'zapatos/schema';

export interface User extends s.user.Selectable {
  role: Role;
}

export interface IAuthenticate {
  readonly user: User;
  readonly token: string;
}
