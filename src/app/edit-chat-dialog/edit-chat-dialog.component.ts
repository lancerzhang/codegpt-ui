import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-chat-dialog',
  templateUrl: './edit-chat-dialog.component.html',
  styleUrls: ['./edit-chat-dialog.component.scss']
})
export class EditChatDialogComponent {
  chatTitle: string;

  constructor(
    public dialogRef: MatDialogRef<EditChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.chatTitle = this.data.chatTitle;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.chatTitle);
  }
}
