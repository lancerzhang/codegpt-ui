import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import Fuse from 'fuse.js';
import * as Papa from 'papaparse';
import { map } from 'rxjs/operators';
import { ChatDbService } from './chat-db.service';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  private promptsCSVPath = 'assets/prompts.csv';
  private prompts: { id: string; act: string; prompt: string }[] = [];
  private fuse: Fuse<{ id: string; act: string; prompt: string }>;

  constructor(private http: HttpClient, private chatDb: ChatDbService) {
    this.initializeService();
  }

  private initializeService(): void {
    this.readCSV().subscribe((data) => {
      this.processCSVData(data);
    });

    this.chatDb.prompts.toArray().then(userPrompts => {
      this.prompts.push(...userPrompts);
      // Initialize Fuse with both system and user prompts
      this.initializeFuse();
    }).catch(err => {
      console.error('Failed to load user prompts:', err);
    });
  }

  private readCSV() {
    return this.http.get(this.promptsCSVPath, { responseType: 'text' }).pipe(
      map((csvData: string) => {
        const parsedData = Papa.parse(csvData, { header: true });
        return parsedData.data as { act: string; prompt: string }[];
      })
    );
  }

  private processCSVData(data: { act: string; prompt: string }[]): void {
    this.prompts = data.map((item) => ({
      id: CryptoJS.MD5(item.prompt).toString(),
      act: item.act,
      prompt: item.prompt,
    }));
    this.initializeFuse();
  }

  private initializeFuse(): void {
    this.fuse = new Fuse(this.prompts, {
      keys: ['act', 'prompt'],
      includeScore: true,
      threshold: 0.3,
    });
  }

  public searchPrompts(query: string): { id: string; act: string; prompt: string }[] {
    const results = this.fuse.search(query);
    return results.slice(0, 10).map((result: any) => result.item);
  }

  public async addPrompt(prompt: { act: string; prompt: string }): Promise<void> {
    // Generate the ID for the new prompt
    const newPromptId = CryptoJS.MD5(prompt.prompt).toString();

    // Check if the prompt already exists in the prompts array
    const promptExists = this.prompts.some(existingPrompt => existingPrompt.id === newPromptId);

    if (!promptExists) {
      // Add the prompt to the database and the prompts array
      await this.chatDb.createPrompt(prompt);
      this.prompts.push({ ...prompt, id: newPromptId });
      this.initializeFuse();
    } else {
      console.warn('The prompt already exists and will not be added again.');
    }
  }


}
