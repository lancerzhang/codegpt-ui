import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatDbService } from '../services/chat-db.service';
import { ChatService } from '../services/chat.service';
import { PromptService } from '../services/prompt.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {
  messages: { text: string, sender: string, isLoading?: boolean }[] = [];
  inputMessage: string = '';
  conversationId: number;
  promptOptions: { id: string; act: string; prompt: string }[] = [];

  constructor(
    private promptService: PromptService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private chatService: ChatService,
    private chatDb: ChatDbService
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.conversationId = +params['conversationId'];
      // Reload data here
      const conversationId = this.route.snapshot.paramMap.get('conversationId');
      if (conversationId) {
        this.conversationId = Number(conversationId);
      }
      this.loadChat();
    });
  }

  async loadChat() {
    this.messages = await this.chatDb.getMessages(this.conversationId);
  }

  async sendMessage() {
    if (this.inputMessage) {
      const loadingMessage = { text: '', sender: 'bot', isLoading: true };
      this.messages.push({ text: this.inputMessage, sender: 'user' });
      this.messages.push(loadingMessage);

      if (!this.conversationId) {
        const title: string = this.inputMessage.slice(0, 30);
        this.conversationId = await this.chatDb.createConversation({ title });
        this.sharedService.emitRefreshChatHistory();
      }
      this.chatDb.createMessage({ conversationId: this.conversationId, sender: 'user', text: this.inputMessage });
      this.chatService.getResponse(this.inputMessage).subscribe(response => {
        loadingMessage.text = response;
        loadingMessage.isLoading = false;
        this.chatDb.createMessage({ conversationId: this.conversationId, sender: 'bot', text: response });
      });

      this.inputMessage = '';
      this.promptOptions = [];
    }
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
