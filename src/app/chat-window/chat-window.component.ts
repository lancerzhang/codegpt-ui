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
        this.chatDb.getConversation(conversationId).then(conversation => {
          this.openaiConfig.models.forEach((model: any) => {
            if (conversation.model) {
              if (model.model == conversation.model) {
                this.openaiConfigService.setSelectedModel(model);
              }
            }
          });
        });
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

  async newConversation(newText: string) {
    if (this.conversationId === -1) {
      const title: string = newText.slice(0, 30);
      const model: string = this.openaiConfig.selectedModel.model;
      this.conversationId = await this.chatDb.createConversation({ title, model });
      this.sharedService.emitRefreshChatHistory();
    }
  }

  async sendMessage(newText: string, parentId: number, childId?: number) {
    var isRegenerate = true;
    if (newText) {
      isRegenerate = false;
    }

    await this.newConversation(newText)

    var messageArray;
    var userMessage: Message;
    var userMessageId: number;
    if (isRegenerate) {
      const lastConversation = this.messages.slice(0, -1);
      messageArray = lastConversation.map((obj: any) => ({ role: obj.role === 'bot' ? 'system' : 'user', content: obj.text }));
      userMessage = this.messages[this.messages.length - 2]!;
      userMessageId = userMessage.id!;
      // delete last answer
      this.truncateMessages(childId!);
      await this.chatDb.updateMessage(childId!, { isActive: false });
    } else {
      // for edit question & regenerate
      if (childId) {
        // delete last question and answer
        this.truncateMessages(childId);
        await this.chatDb.updateMessage(childId, { isActive: false });
      }
      // Prepare the input for getResponse
      messageArray = this.appendHistoryMessages(newText);
      userMessage = { conversationId: this.conversationId, sender: 'user', text: newText, isPrompt: false, parentId: parentId, isActive: true };
      userMessageId = await this.chatDb.createMessage(userMessage);
      userMessage.id = userMessageId;
      this.messages.push(userMessage);
    }

    const botMessage: Message = { conversationId: this.conversationId, sender: 'bot', text: '', isPrompt: false, parentId: userMessageId, isActive: true, isLoading: true };
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

  // This function finds the ID of the parent message by retrieving the ID of the last message in the 'messages' array.
  findLastMessageId(): number {
    // Retrieve the last message from the 'messages' array
    const parentMessage: Message = this.messages.slice(-1)[0];

    // Initialize the parentId variable to -1
    let parentId: number = -1;

    // Check if a parentMessage exists
    if (parentMessage) {
      // If a parentMessage exists, assign its ID to the parentId variable
      parentId = parentMessage.id!;
    }

    // Return the parentId
    return parentId;
  }

  async sendNewMessage() {
    if (this.inputMessage) {
      const parentId = this.findLastMessageId();
      this.sendMessage(this.inputMessage, parentId);
      this.inputMessage = '';
      this.promptOptions = [];
    }
  }

  async editQuestion(newText: string, questionId: number) {
    if (newText) {
      const parentId: number = await this.chatDb.getParentId(questionId);
      await this.sendMessage(newText, parentId, questionId);
    }
  }

  appendHistoryMessages(newMessage: string): any[] {
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

  async switchQuestion({ direction, messageId }: { direction: 'prev' | 'next'; messageId: number }) {
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
    const parentId = this.findLastMessageId();
    return await this.chatDb.loadMessagesWithChildren(this.conversationId, parentId);
  }

  selectModel(model: any) {
    this.openaiConfigService.setSelectedModel(model);
  }

  async regenerate() {
    const lastAnswer: Message = this.messages.slice(-1)[0];
    const lastQustion: Message = this.messages[this.messages.length - 2]!;
    await this.sendMessage('', lastQustion.id!, lastAnswer.id);
  }
}
