import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from './dto/exam.dto';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { decrypt } from 'src/utils';
import { encryptedData } from 'src/exam/dto/exam.dto';

@Injectable()
export class ChatService {
  getSession(sessionId: string) {
    console.log(sessionId);

    const session: string = decrypt(decodeURIComponent(sessionId));
    return JSON.parse(session) as encryptedData;
  }
  private readonly chatPrefix = 'chat';

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async addUserMessage(
    chatId: string,

    message: string,
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const messageId = uuidv4();

    const chatMessage = {
      type: 'user',
      message: message,
      timestamp: timestamp,
      chatId: chatId,
    };

    await this.redis.hset(
      `${this.chatPrefix}:${chatId}`,
      messageId,
      JSON.stringify(chatMessage),
    );
    return messageId;
  }

  async addBotReply(
    chatId: string,
    messageId: string,
    botReply: string,
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    const chatMessage = {
      type: 'bot',
      message: botReply,
      timestamp: timestamp,
      replyTo: messageId,
      chatId: chatId,
    };

    await this.redis.hset(
      `${this.chatPrefix}:${chatId}`,
      uuidv4(),
      JSON.stringify(chatMessage),
    );
  }

  async getChatHistory(chatId: string): Promise<ChatMessage[]> {
    const chatHistory = await this.redis.hgetall(
      `${this.chatPrefix}:${chatId}`,
    );

    return Object.values(chatHistory)
      .map((chat) => JSON.parse(chat))
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }
  
}
