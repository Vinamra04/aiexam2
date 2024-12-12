import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as db from 'zapatos/db';
const bcrypt = require('bcrypt');
import { UserService } from 'src/user/user.service';
import { sign } from 'jsonwebtoken';
import { jwtConstants } from './constant';
import { IAuthenticate } from 'src/user/data';
import { AuthenticateDto } from './dto/authenticate.dto';
import { CreateAdminDto } from '../user/dto/admin.dto';
import { Role } from 'src/role.enum';
import pool from 'src/pgPool';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async authenticate(body: AuthenticateDto): Promise<IAuthenticate> {
    const user = await this.userService.getUser(body.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const { password, ...user_pass } = user;
    const token = sign({ ...user_pass }, jwtConstants.secret);
    return { token, user };
  }

  async register_admin(body: CreateAdminDto) {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(body.password, salt);
    console.log(body);
    const admin = await db
      .insert('user', { ...body, role: Role.Admin, password })
      .run(pool);
    console.log(admin);
    return admin;
  }
  async delete_admin(id: number) {
    const user = await db.deletes('user', { user_id: id }).run(pool);
    console.log(user);
    return user;
  }
}
