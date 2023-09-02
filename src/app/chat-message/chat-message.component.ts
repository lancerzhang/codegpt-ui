import { Clipboard } from '@angular/cdk/clipboard';
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
  @Output() editQuestion = new EventEmitter<string>();
  @Output() switchQuestion = new EventEmitter<{ direction: 'prev' | 'next'; messageId: number }>();

  isEditing: boolean = false;
  editMessage: string;
  htmlContent: SafeHtml;

  constructor(private sanitizer: DomSanitizer, private clipboard: Clipboard) {
  }

  ngOnInit(): void {
    const escapedXmlString = this.message.text
      .replace(/&/g, '&amp;')
      .replace(/ /g, '&nbsp;')
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
    this.editQuestion.emit(this.editMessage);
  }

  cancelEdit() {
    this.isEditing = false;
  }

  prevMessage() {
    if (this.message.activePeerIndex! > 0) {
      this.switchQuestion.emit({ direction: 'prev', messageId: this.message.id! });
    }
  }

  nextMessage() {
    if (this.message.activePeerIndex! < this.message.peersIds!.length - 1) {
      this.switchQuestion.emit({ direction: 'next', messageId: this.message.id! });
    }
  }

  isCopied = false; // Add this variable to your component

  // Function to copy message text
  copyMessageToClipboard(text: string) {
    this.clipboard.copy(text);
    this.isCopied = true;

    // Reset after 1 second
    setTimeout(() => {
      this.isCopied = false;
    }, 1000);
  }

}
