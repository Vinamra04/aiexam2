import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import pool from 'src/pgPool';
import * as db from 'zapatos/db';
@Injectable()
export class BotService {
  public openai: OpenAI;
  private threadMap: Map<string, string>;
  private assistantMap: Map<string, string>;
  constructor() {
    const configuration = {
      apiKey: process.env.OPENAI_API_KEY,
    };
    this.openai = new OpenAI(configuration);
    this.threadMap = new Map();
    this.assistantMap = new Map();
  }

  async getResponse(
    message: string,
    data: { chat_id: string; exam_id: number },
  ) {
    const key = `${data.chat_id}_${data.exam_id}`;
    const assistant_id = await this.get_assistant(key, data);
    const thread_id = await this.get_thread(key);

    await this.openai.beta.threads.messages.create(thread_id, {
      role: 'user',
      content: message,
    });
    const run = await this.openai.beta.threads.runs.createAndPoll(thread_id, {
      assistant_id: assistant_id,
    });
    if (run.status === 'completed') {
      const messages = await this.openai.beta.threads.messages.list(
        run.thread_id,
      );
      const lastMessage = messages.data[messages.data.length - 1];
      return lastMessage.content[0].type === 'text'
        ? lastMessage.content[0].text
        : 'Invalid response';
    }
    return 'Invalid response';
  }

  private async get_assistant(
    key: string,
    data: { chat_id: string; exam_id: number },
  ) {
    const persona_id = (await this.getPersonaIdFromExam(data.exam_id))
      .persona_id;
    const assistant_id =
      this.threadMap.get(key) ||
      (await this.createAssistant(persona_id)).assistant_id;
    this.assistantMap.set(key, assistant_id);
    return assistant_id;
  }

  private async get_thread(key: string) {
    const thread_id: string =
      this.threadMap.get(key) || (await this.createThread()).id;
    this.threadMap.set(key, thread_id);
    return thread_id;
  }

  async createAssistant(persona_id: number) {
    let assistant = await db
      .selectExactlyOne('open_ai_assistant', { persona_id })
      .run(pool);
    if (assistant) {
      return assistant;
    }
    const persona = await this.getPersona(persona_id);
    const new_assistant = await this.openai.beta.assistants.create({
      name: persona.title,
      instructions: persona.prompt,
      model: 'gpt-4o',
    });
    assistant = await db
      .insert('open_ai_assistant', {
        assistant_id: new_assistant.id,
        persona_id,
      })
      .run(pool);
    return assistant;
  }

  async createThread() {
    const thread = await this.openai.beta.threads.create();
    return thread;
  }

  getPersona(persona_id: number) {
    return db.selectExactlyOne('persona', { persona_id }).run(pool);
  }
  async getPersonaIdFromExam(exam_id: number) {
    const exam = await db
      .selectExactlyOne('exam', { exam_id }, { columns: ['persona_id'] })
      .run(pool);
    return {
      persona_id: exam.persona_id,
    };
  }
}
