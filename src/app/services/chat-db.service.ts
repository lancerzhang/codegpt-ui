import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { Message } from '../../models/message.model';

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
      messages: '++id, conversationId, sender, text, numTokens, isPrompt, parentId, isActive, createdAt, [conversationId+parentId]',
      conversations: '++id, title, model, lastUpdatedAt',
      prompts: '++id, act, prompt'
    });
    this.messages = this.table('messages');
    this.conversations = this.table('conversations');
    this.prompts = this.table('prompts');
  }

  async createMessage(message: Message) {
    message['createdAt'] = new Date();
    return await this.messages.add(message);
  }

  async createConversation(conversation: { title: string, model: string, lastUpdatedAt?: Date }) {
    conversation['lastUpdatedAt'] = new Date();
    return await this.conversations.add(conversation);
  }

  async createPrompt(prompt: { act: string, prompt: string }) {
    return await this.prompts.add(prompt);
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

  async updateMessage(messageId: number, changes: Partial<Message>): Promise<number> {
    return await this.messages.update(messageId, changes);
  }

  async getMessage(messageId: number): Promise<Message> {
    return await this.messages.get(messageId);
  }

  async getConversation(conversationId: string | number): Promise<any> {
    // Ensure conversationId is treated as a number
    return await this.conversations.get(Number(conversationId));
  }


  async getParentId(childId: number): Promise<number> {
    const message: Message = await this.messages.get(childId);
    return message!.parentId!;
  }

  async loadMessagesWithChildren(conversationId: number, parentId: number = -1): Promise<Message[]> {
    // Load the direct child messages of the parent message.
    let directChildMessages = await this.messages.where({ conversationId: conversationId, parentId: parentId }).toArray();

    // Filter for the active direct child message.
    let activeDirectChildMessage = directChildMessages.find(msg => msg.isActive);

    // If there is no active direct child message, stop the recursion.
    if (!activeDirectChildMessage) {
      return [];
    }

    // Recursively load the active child messages for the active direct child message.
    let activeChildMessages = await this.loadMessagesWithChildren(conversationId, activeDirectChildMessage.id);

    // Store the IDs of the peer messages in the active direct child message.
    activeDirectChildMessage.peersIds = directChildMessages.map(msg => msg.id);

    // Store the active peer index in the active direct child message.
    activeDirectChildMessage.activePeerIndex = activeDirectChildMessage.peersIds.indexOf(activeDirectChildMessage.id);

    // Concatenate the active direct child message with its active child messages.
    return [activeDirectChildMessage, ...activeChildMessages];
  }


}
