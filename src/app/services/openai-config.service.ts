import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OpenaiConfigService {
  private openai: any = null;

  constructor(private http: HttpClient) { }

  setSelectedModel(model: any) {
    this.openai.selectedModel = model;
  }

  getOpenAIConfig(): Observable<any> {
    if (this.openai) {
      return of(this.openai);
    } else {
      return this.http
        .get(`${environment.apiBase}/config`)
        .pipe(
          map((data: any) => {
            data.selectedModel = data.models[0]; // Select the first model by default
            return data;
          }),
          tap((data) => (this.openai = data))
        );
    }
  }
}
