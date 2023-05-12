import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent {
  messages = [
    { text: 'Hello, how can I help you?', sender: 'bot' }
  ];

  inputMessage = '';

  constructor(private http: HttpClient) { }

  sendMessage() {
    this.messages.push({ text: this.inputMessage, sender: 'user' });
    this.inputMessage = '';
    this.http.post('http://your-api-url.com', { message: this.inputMessage }).subscribe((response: any) => {
      this.messages.push({ text: response.message, sender: 'bot' });
    });
  }
}
