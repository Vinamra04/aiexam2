import { Module } from '@nestjs/common';
import { FlagService } from './flag.service';
import { FlagController } from './flag.controller';

@Module({
  providers: [FlagService],
  controllers: [FlagController]
})
export class FlagModule {}
