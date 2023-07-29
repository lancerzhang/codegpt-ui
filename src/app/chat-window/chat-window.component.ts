import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../../models/message.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ChatApiService } from '../services/chat-api.service';
import { ChatDbService } from '../services/chat-db.service';
import { OpenaiConfigService } from '../services/openai-config.service';
import { PromptService } from '../services/prompt.service';
import { SharedService } from '../services/shared.service';


@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {
  openaiConfig: any;
  messages: Message[] = [];
  inputMessage: string = '';
  conversationId: number = -1;
  promptOptions: { id: string; act: string; prompt: string }[] = [];
  @ViewChild('textarea') textarea: ElementRef;

  constructor(
    private dialog: MatDialog,
    private promptService: PromptService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private chatApiService: ChatApiService,
    private chatDb: ChatDbService,
    private openaiConfigService: OpenaiConfigService
  ) { }

  async ngOnInit() {
    this.openaiConfigService.getOpenAIConfig().subscribe(data => {
      this.openaiConfig = data;
    });
    this.route.params.subscribe(params => {
      // Reload data here
      const conversationId = params['conversationId'];
      if (conversationId) {
        this.conversationId = Number(conversationId);
        this.loadChat();
      }
    });
    this.sharedService.getRefreshChatWindow().subscribe(() => {
      this.messages = [];
      this.inputMessage = '';
      this.conversationId = -1;

      this.openaiConfigService.setSelectedModel(this.openaiConfig.models[0]);
    });
  }

  async loadChat() {
    this.messages = await this.loadMessagesWithChildren();
  }

  async sendMessage(newText: string, parentId: number, childId?: number) {
    if (newText) {
      if (this.conversationId === -1) {
        const title: string = newText.slice(0, 30);
        this.conversationId = await this.chatDb.createConversation({ title });
        this.sharedService.emitRefreshChatHistory();
      }

      // for branch message
      if (childId) {
        await this.chatDb.updateMessage(childId, { isActive: false });
        this.truncateMessages(childId);
      }

      // Prepare the input for getResponse
      const messageArray = this.prepareMessages(newText);

      // update messages of pages
      let userMessage: Message = { conversationId: this.conversationId, sender: 'user', text: newText, isPrompt: false, parentId: parentId, isActive: true };
      const userMessageId: number = await this.chatDb.createMessage(userMessage);
      userMessage.id = userMessageId;
      const botMessage: Message = { conversationId: this.conversationId, sender: 'bot', text: '', isPrompt: false, parentId: userMessageId, isActive: true, isLoading: true };

      this.messages.push(userMessage);
      this.messages.push(botMessage);

      // Send the array of messages to getResponse
      this.chatApiService.getResponse(messageArray).subscribe(async (response: any) => {
        const respContent = response.data.choices[0].message.content;
        userMessage.numTokens = response.data.usage.prompt_tokens;
        await this.createBotMessage(respContent, response.data.usage.completion_tokens, botMessage, userMessageId, childId);
      }, async error => {
        let message;
        if (error.status === 429) {
          const selectedModel = this.openaiConfig.selectedModel;
          message = `You have exceeded the chat limit of model ${selectedModel.model}, ${selectedModel.rateLimit.requests} requests in ${selectedModel.rateLimit.minutes} minutes`;
        } else {
          message = 'System error, please retry.';
        }
        await this.createBotMessage(message, 0, botMessage, userMessageId, childId);
      });
    }
  }

  async createBotMessage(text: string, numTokens: number, botMessage: any, userMessageId: number, childId?: number) {
    botMessage.text = text;
    const botMessageId: number = await this.chatDb.createMessage(botMessage);
    botMessage.id = botMessageId
    botMessage.numTokens = numTokens;
    botMessage.isLoading = false;
    await this.chatDb.updateMessage(botMessageId, { isLoading: false });
    // to update peersIds and activePeerIndex
    if (childId) {
      await this.replaceMessageWithChildren(userMessageId, userMessageId);
    }
  }

  truncateMessages(messageId: number) {
    // Find the index of the messageId in the messages array.
    const messageIdIndex = this.messages.findIndex(message => message.id === messageId);
    // Slice the messages array from the beginning to messageIdIndex.
    this.messages = this.messages.slice(0, messageIdIndex);
  }

  findParentId(): number {
    const parentMessage: Message = this.messages.slice(-1)[0];
    let parentId: number = -1;
    if (parentMessage) {
      parentId = parentMessage.id!;
    }
    return parentId;
  }

  async sendNewMessage() {
    const parentId = this.findParentId();
    this.sendMessage(this.inputMessage, parentId);
    this.inputMessage = '';
    this.promptOptions = [];
  }

  async branchMessage(newText: string, childId: number) {
    const parentId: number = await this.chatDb.getParentId(childId);
    await this.sendMessage(newText, parentId, childId);
  }

  prepareMessages(newMessage: string): any[] {
    const maxChats = this.openaiConfig.selectedModel.session.chats;
    const maxTokens = this.openaiConfig.selectedModel.session.tokens;
    let currentTokens = 0;
    const messageArray = [];

    // Iterate over the messages in reverse order
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i];
      const role = message.sender === 'bot' ? 'system' : 'user';
      const tokens = message.numTokens || 0;

      // If adding the next message exceeds the maxContextTokens, break the loop
      if (currentTokens + tokens > maxTokens || messageArray.length >= maxChats) {
        break;
      }

      messageArray.unshift({ role, content: message.text });
      currentTokens += tokens;
    }

    // Add the new message
    messageArray.push({ role: 'user', content: newMessage });

    return messageArray;
  }

  onInputChange(): void {
    if (this.inputMessage.startsWith('/')) {
      const query = this.inputMessage.slice(1);
      this.promptOptions = this.promptService.searchPrompts(query);
    }
  }

  onOptionSelected(event: any): void {
    this.inputMessage = event.option.value;
  }

  addPrompt(message: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { actionName: "Add", reourceName: "prompt" }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        message.isPrompt = true;
        this.chatDb.updateIsPrompt(message.id, true);
        this.promptService.addPrompt({ act: '', prompt: message.text });
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      // If Shift is not pressed, call sendMessage() and prevent default behavior
      if (!event.shiftKey) {
        event.preventDefault();
        this.sendNewMessage();
      }
    }
  }

  async switchMessage({ direction, messageId }: { direction: 'prev' | 'next'; messageId: number }) {
    // Find the index of the messageId in the messages array.
    const messageIdIndex = this.messages.findIndex(message => message.id === messageId);

    // Get the message at messageIdIndex.
    const message = this.messages[messageIdIndex];

    // Calculate the new active peer index.
    let newActivePeerIndex = direction === 'prev' ? message.activePeerIndex! - 1 : message.activePeerIndex! + 1;

    // Get the new message ID.
    let newMessageId = message.peersIds![newActivePeerIndex];
    await this.chatDb.updateMessage(messageId, { isActive: false });
    await this.replaceMessageWithChildren(messageId, newMessageId);
  }

  async replaceMessageWithChildren(messageId: number, newMessageId: number) {
    this.truncateMessages(messageId);
    // Update the isActive
    await this.chatDb.updateMessage(newMessageId, { isActive: true });

    // Reload messages starting from newMessageId and concatenate with the existing messages.
    let newMessages = await this.loadMessagesWithChildren();
    this.messages = [...this.messages, ...newMessages];
  }

  async loadMessagesWithChildren() {
    const parentId = this.findParentId();
    return await this.chatDb.loadMessagesWithChildren(this.conversationId, parentId);
  }

  selectModel(model: any) {
    this.openaiConfigService.setSelectedModel(model);
  }
}
