import { Component } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {
  messages = [
    { text: 'Hello, how can I help you?', sender: 'bot' }
  ];

  inputMessage = '';

  constructor(private chatService: ChatService) { }

  sendMessage() {
    this.messages.push({ text: this.inputMessage, sender: 'user' });
    this.inputMessage = '';
    this.chatService.getResponse(this.inputMessage).subscribe(response => {
      this.messages.push({ text: response, sender: 'bot' });
    });
  }
}
