import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatDbService } from '../services/chat-db.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit {
  messages: { text: string, sender: string, isLoading?: boolean }[] = [];
  inputMessage: string = '';
  conversationId: number;

  constructor(
    private chatService: ChatService,
    private chatDb: ChatDbService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const conversationId = params.get('conversationId');
      console.log("conversationId", conversationId)
      // if (conversationId) {
      //   this.conversationId = Number(conversationId);
      //   this.messages = await this.chatDb.getMessages(this.conversationId);
      // }
    });
  }


  async sendMessage() {
    if (this.inputMessage) {
      const loadingMessage = { text: '', sender: 'bot', isLoading: true };
      this.messages.push({ text: this.inputMessage, sender: 'user' });
      this.messages.push(loadingMessage);

      if (!this.conversationId) {
        const title: string = "new conversation";
        this.conversationId = await this.chatDb.createConversation({ title });
      }
      this.chatDb.createMessage({ conversationId: this.conversationId, sender: 'user', text: this.inputMessage });
      this.chatService.getResponse(this.inputMessage).subscribe(response => {
        loadingMessage.text = response;
        loadingMessage.isLoading = false;
        this.chatDb.createMessage({ conversationId: this.conversationId, sender: 'bot', text: response });
      });

      this.inputMessage = '';
    }
  }
}
