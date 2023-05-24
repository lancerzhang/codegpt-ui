import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private refreshChatHistorySubject = new Subject<void>();
  private refreshChatWindowSubject = new Subject<void>();

  emitRefreshChatHistory() {
    this.refreshChatHistorySubject.next();
  }

  getRefreshChatHistory() {
    return this.refreshChatHistorySubject.asObservable();
  }

  emitRefreshChatWindow() {
    this.refreshChatWindowSubject.next();
  }

  getRefreshChatWindow() {
    return this.refreshChatWindowSubject.asObservable();
  }
}
