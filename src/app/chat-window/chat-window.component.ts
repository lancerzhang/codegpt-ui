import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ChatApiService } from '../services/chat-api.service';
import { ChatDbService } from '../services/chat-db.service';
import { PromptService } from '../services/prompt.service';
import { SharedService } from '../services/shared.service';
import { environment } from './../../environments/environment';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {
  messages: { id?: number, sender: string, text: string, numTokens: number, isPrompt: boolean, isLoading?: boolean, isLast?: boolean }[] = [];
  inputMessage: string = '';
  conversationId: number;
  promptOptions: { id: string; act: string; prompt: string }[] = [];

  constructor(
    private dialog: MatDialog,
    private promptService: PromptService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private chatApiService: ChatApiService,
    private chatDb: ChatDbService
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.conversationId = +params['conversationId'];
      // Reload data here
      const conversationId = this.route.snapshot.paramMap.get('conversationId');
      if (conversationId) {
        this.conversationId = Number(conversationId);
        this.loadChat();
      }
    });
  }

  async loadChat() {
    this.messages = await this.chatDb.getMessages(this.conversationId);

    let lastUserMessageIndex = -1;
    let lastBotMessageIndex = -1;

    this.messages.forEach((message, index) => {
      if (message.sender === 'user') {
        if (lastUserMessageIndex !== -1) {
          this.messages[lastUserMessageIndex].isLast = false;
        }
        lastUserMessageIndex = index;
      } else if (message.sender === 'bot') {
        if (lastBotMessageIndex !== -1) {
          this.messages[lastBotMessageIndex].isLast = false;
        }
        lastBotMessageIndex = index;
      }
    });

    if (lastUserMessageIndex !== -1) {
      this.messages[lastUserMessageIndex].isLast = true;
    }
    if (lastBotMessageIndex !== -1) {
      this.messages[lastBotMessageIndex].isLast = true;
    }
  }

  async sendMessage() {
    if (this.inputMessage) {
      if (!this.conversationId) {
        const title: string = this.inputMessage.slice(0, 30);
        this.conversationId = await this.chatDb.createConversation({ title });
        this.sharedService.emitRefreshChatHistory();
      }

      // Reset all isLast flags
      for (const message of this.messages) {
        message.isLast = false;
      }

      // Prepare the input for getResponse
      const messageArray = this.prepareMessages(this.inputMessage);

      // update messages of pages
      const userMessageId: number = await this.chatDb.createMessage({ conversationId: this.conversationId, sender: 'user', text: this.inputMessage });
      const userMessage = { id: userMessageId, sender: 'user', text: this.inputMessage, numTokens: 0, isPrompt: false, isLast: true };
      const botMessage = { id: -1, sender: 'bot', text: '', numTokens: 0, isPrompt: false, isLast: true, isLoading: true };

      this.messages.push(userMessage);
      this.messages.push(botMessage);

      // Send the array of messages to getResponse
      this.chatApiService.getResponse(messageArray).subscribe(async (response: any) => {
        const respContent = response.data.choices[0].message.content;

        userMessage.numTokens = response.data.usage.prompt_tokens;

        const botMessageId: number = await this.chatDb.createMessage({ conversationId: this.conversationId, sender: 'bot', text: respContent });
        botMessage.id = botMessageId
        botMessage.numTokens = response.data.usage.completion_tokens;
        botMessage.text = respContent;
        botMessage.isLoading = false;
      });

      this.inputMessage = '';
      this.promptOptions = [];
    }
  }

  prepareMessages(newMessage: string): any[] {
    const maxContextTokens = environment.maxContextTokens;
    let currentTokens = 0;
    const messageArray = [];

    // Iterate over the messages in reverse order
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i];
      const role = message.sender === 'bot' ? 'system' : 'user';
      const tokens = message.numTokens || 0;

      // If adding the next message exceeds the maxContextTokens, break the loop
      if (currentTokens + tokens > maxContextTokens) {
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

  regenerateResponse() {
    this.inputMessage = this.messages[this.messages.length - 2].text;
    this.messages.splice(-2);
    this.sendMessage();
  }
}
