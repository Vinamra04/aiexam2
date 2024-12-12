import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './admin.controller';
import { TeacherController } from './teacher.controller';

@Module({
  providers: [UserService],
  controllers: [UserController, TeacherController],
  exports: [UserService],
})
export class UserModule {}
