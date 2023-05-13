// chat-db.service.ts
import { Injectable } from '@angular/core';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class ChatDbService extends Dexie {
  messages: Dexie.Table<any, number>;
  conversations: Dexie.Table<any, number>;

  constructor() {
    super('ChatDatabase');
    this.version(1).stores({
      messages: '++id, conversationId, sender, createdAt, text',
      conversations: '++id, title, lastUpdatedAt'
    });
    this.messages = this.table('messages');
    this.conversations = this.table('conversations');
  }

  async createMessage(message: { conversationId: number, sender: string, text: string, createdAt?: Date }) {
    message['createdAt'] = new Date();
    return await this.messages.add(message);
  }

  async createConversation(conversation: { title: string, lastUpdatedAt?: Date }) {
    conversation['lastUpdatedAt'] = new Date();
    return await this.conversations.add(conversation);
  }

  async getMessages(conversationId: number) {
    return await this.messages.where('conversationId').equals(conversationId).toArray();
  }
}
