import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  messages: { text: string, sender: string, numTokens: number, isLoading?: boolean }[] = [];
  inputMessage: string = '';
  conversationId: number;
  promptOptions: { id: string; act: string; prompt: string }[] = [];

  constructor(
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
  }

  async sendMessage() {
    if (this.inputMessage) {
      const loadingMessage = { text: '', sender: 'bot', numTokens: 0, isLoading: true };
      const userMessage = { text: this.inputMessage, sender: 'user', numTokens: 0 };

      // Prepare the input for getResponse
      const messageArray = this.prepareMessages(this.inputMessage);

      this.messages.push(userMessage);
      this.messages.push(loadingMessage);

      if (!this.conversationId) {
        const title: string = this.inputMessage.slice(0, 30);
        this.conversationId = await this.chatDb.createConversation({ title });
        this.sharedService.emitRefreshChatHistory();
      }
      this.chatDb.createMessage({ conversationId: this.conversationId, sender: 'user', text: this.inputMessage });

      // Send the array of messages to getResponse
      this.chatApiService.getResponse(messageArray).subscribe((response: any) => {
        const respContent = response.data.choices[0].message.content;
        userMessage.numTokens = response.data.usage.prompt_tokens;
        loadingMessage.numTokens = response.data.usage.completion_tokens;

        loadingMessage.text = respContent;
        loadingMessage.isLoading = false;
        this.chatDb.createMessage({ conversationId: this.conversationId, sender: 'bot', text: respContent });
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
    console.log("this.inputMessage", this.inputMessage)
    if (this.inputMessage.startsWith('/')) {
      const query = this.inputMessage.slice(1);
      this.promptOptions = this.promptService.searchPrompts(query);
    }
  }

  onOptionSelected(event: any): void {
    this.inputMessage = event.option.value;
  }
}
