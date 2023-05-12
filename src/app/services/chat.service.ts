import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private counter = 0;

  constructor(private http: HttpClient) { }

  getResponse(inputMessage: string): Observable<string> {
    this.counter++;

    const mockResponse = 'This is a mock response for: ' + inputMessage;
    const jsonFile1 = 'assets/dummy/chat-response-1.json';
    const jsonFile2 = 'assets/dummy/chat-response-2.json';
    const jsonFile3 = 'assets/dummy/chat-response-3.json';


    return of(this.counter).pipe(
      delay(1000),
      switchMap(counter => {
        switch (counter % 3) {
          case 1:
            return this.getJsonData(jsonFile1);
          case 2:
            return this.getJsonData(jsonFile2);
          default:
            return this.getJsonData(jsonFile3);
        }
      })
    );
  }

  private getJsonData(filePath: string): Observable<string> {
    return this.http.get(filePath).pipe(map((data: any) => data.data.choices[0].message.content));
  }

}
