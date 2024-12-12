export interface ExamData {
  userId: string;
  topic: string;
  createdAt: string;
}

export interface ChatMessage {
  type: 'user' | 'bot';
  message: string;
  timestamp: string;
  examId: string;
  replyTo?: string;
}
