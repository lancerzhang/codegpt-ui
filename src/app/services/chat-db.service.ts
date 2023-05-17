import { Injectable } from '@angular/core';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class ChatDbService extends Dexie {
  messages: Dexie.Table<any, number>;
  conversations: Dexie.Table<any, number>;
  prompts: Dexie.Table<any, number>;

  constructor() {
    super('ChatDatabase');
    this.version(1).stores({
      messages: '++id, conversationId, sender, text, isPrompt, createdAt',
      conversations: '++id, title, lastUpdatedAt',
      prompts: '++id, act, prompt'
    });
    this.messages = this.table('messages');
    this.conversations = this.table('conversations');
    this.prompts = this.table('prompts');
  }

  async createMessage(message: { id?: number, conversationId: number, sender: string, text: string, createdAt?: Date }) {
    message['createdAt'] = new Date();
    return await this.messages.add(message);
  }

  async createConversation(conversation: { title: string, lastUpdatedAt?: Date }) {
    conversation['lastUpdatedAt'] = new Date();
    return await this.conversations.add(conversation);
  }

  async createPrompt(prompt: { act: string, prompt: string }) {
    return await this.prompts.add(prompt);
  }

  async getMessages(conversationId: number) {
    return await this.messages.where('conversationId').equals(conversationId).toArray();
  }

  async getConversationsSortedByDate(): Promise<any[]> {
    return await this.conversations
      .orderBy('lastUpdatedAt')
      .reverse()
      .toArray();
  }

  async updateChatTitle(chatId: number, newTitle: string) {
    return await this.conversations.update(chatId, { title: newTitle });
  }

  async updateIsPrompt(messageId: number, isPrompt: boolean) {
    return await this.messages.update(messageId, { isPrompt: isPrompt });
  }

  async deleteChat(chatId: number) {
    return await this.conversations.delete(chatId);
  }

  clearConversations(): Promise<void> {
    this.messages.clear();
    return this.conversations.clear();
  }

}
