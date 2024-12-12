import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { BotService } from 'src/bot/bot.service';
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly botService: BotService,
  ) {}
  @Get('session/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    const session = await this.chatService.getSession(sessionId);
    return session;
  }
  @Post(':chatId')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body('message') message: string,
  ) {
    const messageId = await this.chatService.addUserMessage(chatId, message);

    const botReply = await this.botService.getResponse(message, {
      chat_id: chatId,
      exam_id: 0,
    });
    if (botReply == 'Invalid response') {
      await this.chatService.addBotReply(chatId, messageId, botReply);
      return { status: 'Message received' };
    }

    await this.chatService.addBotReply(chatId, messageId, botReply.value);

    return { status: 'Message received' };
  }

  @Get(':chatId')
  async getChatHistory(@Param('chatId') chatId: string) {
    const chatHistory = await this.chatService.getChatHistory(chatId);
    return chatHistory;
  }
}
