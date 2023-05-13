import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit {
  messages: { text: string, sender: string, isLoading?: boolean }[] = [];
  inputMessage: string = '';

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
  }

  sendMessage() {
    if (this.inputMessage) {
      const loadingMessage = { text: '', sender: 'bot', isLoading: true };
      this.messages.push({ text: this.inputMessage, sender: 'user' });
      this.messages.push(loadingMessage);

      this.inputMessage = '';
      this.chatService.getResponse(this.inputMessage).subscribe(response => {
        loadingMessage.text = response;
        loadingMessage.isLoading = false;
      });
    }
  }
}
