import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent {
  @Input() message: { sender: string, text: string, isPrompt: boolean, isLoading?: boolean };
  @Output() addPrompt: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
