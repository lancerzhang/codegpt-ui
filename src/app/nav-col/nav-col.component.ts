import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatDbService } from '../services/chat-db.service';

@Component({
  selector: 'app-nav-col',
  templateUrl: './nav-col.component.html',
  styleUrls: ['./nav-col.component.scss']
})
export class NavColComponent implements OnInit {
  chatHistory: any[] = [];
  username: string = 'User';
  conversationId: number;
  selectedChat: any;

  constructor(private router: Router, private route: ActivatedRoute, private chatDbService: ChatDbService) { }

  ngOnInit(): void {
    const conversationId = this.route.snapshot.paramMap.get('conversationId');
    if (conversationId) {
      this.conversationId = Number(conversationId);
    }
    this.loadConversations();
  }

  newChat(): void {
    this.router.navigate(['']);
  }

  selectChat(chat: any): void {
    this.router.navigate(['/chat', chat.id]);
  }


  editChat(chat: any): void {
    // Implement your edit chat logic here
  }

  deleteChat(chat: any): void {
    // Implement your delete chat logic here
  }

  showIcons(chat: any): boolean {
    return this.conversationId === chat.id;
  }

  async loadConversations() {
    this.chatHistory = await this.chatDbService.getConversationsSortedByDate();
  }
}
