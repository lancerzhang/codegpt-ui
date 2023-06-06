import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent {
  @Input() message: Message;
  @Output() addPrompt = new EventEmitter<any>();
  @Output() branchMessage = new EventEmitter<string>();
  @Output() switchMessage = new EventEmitter<{ direction: 'prev' | 'next'; messageId: number }>();

  isEditing: boolean = false;
  editMessage: string;
  htmlContent: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    const escapedXmlString = this.message.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(escapedXmlString.replace(/\n/g, '<br/>'));
  }

  startEditing() {
    this.isEditing = true;
    this.editMessage = this.message.text;
  }

  submitEdit() {
    this.isEditing = false;
    this.branchMessage.emit(this.editMessage);
  }

  cancelEdit() {
    this.isEditing = false;
  }

  prevMessage() {
    if (this.message.activePeerIndex! > 0) {
      this.switchMessage.emit({ direction: 'prev', messageId: this.message.id! });
    }
  }

  nextMessage() {
    if (this.message.activePeerIndex! < this.message.peersIds!.length - 1) {
      this.switchMessage.emit({ direction: 'next', messageId: this.message.id! });
    }
  }

}
