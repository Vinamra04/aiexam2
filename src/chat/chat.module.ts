import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { BotModule } from 'src/bot/bot.module';
import { BotService } from 'src/bot/bot.service';

@Module({
  imports: [BotModule],
  providers: [ChatService, BotService],
  controllers: [ChatController],
})
export class ChatModule {}
