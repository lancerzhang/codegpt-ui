import { Component } from '@angular/core';

@Component({
  selector: 'app-nav-col',
  templateUrl: './nav-col.component.html',
  styleUrls: ['./nav-col.component.scss']
})
export class NavColComponent {
  chatHistory = [
    /* Populate with past chat summaries */
  ];
  username = 'Your username';

  newChat() {
    /* Implement new chat creation logic here */
  }
}
