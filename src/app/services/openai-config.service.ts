import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OpenaiConfigService {
  private openaiSubject = new BehaviorSubject<any>(null);
  openai$ = this.openaiSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchOpenAIConfig().subscribe();
  }

  setSelectedModel(model: any) {
    const openai = this.openaiSubject.value;
    openai.selectedModel = model;
    this.openaiSubject.next(openai);
  }

  private fetchOpenAIConfig(): Observable<any> {
    return this.http
      .get(`${environment.apiBase}/config`)
      .pipe(
        map((data: any) => {
          data.selectedModel = data.models[0]; // Select the first model by default
          return data;
        }),
        tap((data) => this.openaiSubject.next(data))
      );
  }

  getOpenAIConfig(): Observable<any> {
    return this.openai$;
  }
}

