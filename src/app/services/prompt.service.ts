import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import Fuse from 'fuse.js';
import * as Papa from 'papaparse';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  private promptsCSVPath = 'assets/prompts.csv';
  private systemPrompts: { id: string; act: string; prompt: string }[] = [];
  private fuse: Fuse<{ id: string; act: string; prompt: string }>;

  constructor(private http: HttpClient) {
    this.initializeService();
  }

  private initializeService(): void {
    this.readCSV().subscribe((data) => {
      this.processCSVData(data);
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
    this.systemPrompts = data.map((item) => ({
      id: CryptoJS.MD5(item.prompt).toString(),
      act: item.act,
      prompt: item.prompt,
    }));
    this.initializeFuse();
  }

  private initializeFuse(): void {
    this.fuse = new Fuse(this.systemPrompts, {
      keys: ['act', 'prompt'],
      includeScore: true,
      threshold: 0.3,
    });
  }

  public getPrompts(): { id: string; act: string; prompt: string }[] {
    return this.systemPrompts;
  }

  public searchPrompts(query: string): { id: string; act: string; prompt: string }[] {
    const results = this.fuse.search(query);
    return results.slice(0, 10).map((result: any) => result.item);
  }
}
