import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EditChatDialogComponent } from '../edit-chat-dialog/edit-chat-dialog.component';
import { ChatDbService } from '../services/chat-db.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-nav-col',
  templateUrl: './nav-col.component.html',
  styleUrls: ['./nav-col.component.scss']
})
export class NavColComponent implements OnInit {
  chatHistory: any[] = [];
  username: string = 'YourName';
  conversationId: number;
  selectedChat: any;

  constructor(private dialog: MatDialog,
    private sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute,
    private chatDbService: ChatDbService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.conversationId = +params['conversationId'];
      // Reload data here
      const conversationId = this.route.snapshot.paramMap.get('conversationId');
      if (conversationId) {
        this.conversationId = Number(conversationId);
      }
      this.loadChats();
    });
    this.sharedService.getRefreshChatHistory().subscribe(() => {
      this.loadChats();
    });
  }

  newChat(): void {
    this.router.navigate(['']);
  }

  goto(path: string): void {
    this.router.navigate([path]);
  }

  selectChat(chat: any): void {
    this.router.navigate(['/chat', chat.id]);
  }

  editChat(chat: { id: number, title: string }) {
    const dialogRef = this.dialog.open(EditChatDialogComponent, {
      data: { chatTitle: chat.title } // pass current title to dialog
    });

    dialogRef.afterClosed().subscribe(newTitle => {
      if (newTitle) {
        this.chatDbService.updateChatTitle(chat.id, newTitle).then(() => {
          this.loadChats(); // reload chats after editing
        });
      }
    });
  }

  deleteChat(chatId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { actionName: "Delete", reourceName: "chat" }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chatDbService.deleteChat(chatId).then(() => {
          this.loadChats(); // reload chats after deleting
          if (this.router.url === `/chat/${chatId}`) {
            this.newChat();
          }
        });
      }
    });
  }

  showAction(chat: any): boolean {
    return this.conversationId === chat.id;
  }

  async loadChats() {
    this.chatHistory = await this.chatDbService.getConversationsSortedByDate();
  }

  clearConversations(): void {
    this.chatDbService.clearConversations().then(() => {
      console.log('All conversations cleared.');
      window.location.href = '/';
    }).catch((err) => {
      console.error('Failed to clear conversations:', err);
    });
  }
}
