import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as Papa from 'papaparse';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ChatDbService } from '../services/chat-db.service';

@Component({
  selector: 'app-prompts',
  templateUrl: './prompts.component.html',
  styleUrls: ['./prompts.component.scss']
})
export class PromptsComponent {

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  constructor(
    private dialog: MatDialog,
    private chatDb: ChatDbService,
    private router: Router) { }

  async downloadPromptsCSV(): Promise<void> {
    // Retrieve prompts from the database
    const prompts = await this.chatDb.prompts.toArray();

    // Convert the prompts into CSV format
    const csvData = Papa.unparse(prompts);

    // Create a Blob from the CSV data
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    // Initiate a file download
    FileSaver.saveAs(blob, 'prompts.csv');
  }

  uploadPromptsCSV(file: File): void {
    if (file) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { actionName: "Add", reourceName: "prompt" }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          const fileReader = new FileReader();
          fileReader.onload = async () => {
            const csvData = fileReader.result as string;

            // Parse the CSV data
            const parsedData = Papa.parse(csvData, { header: true, skipEmptyLines: true });
            const newPrompts = parsedData.data as { act: string; prompt: string }[];

            // Clear existing prompts
            await this.chatDb.prompts.clear();

            // Add new prompts
            await this.chatDb.prompts.bulkAdd(newPrompts);
            // Clear the input file
            this.fileInput.nativeElement.value = "";
          };

          fileReader.readAsText(file);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['']);
  }

}
