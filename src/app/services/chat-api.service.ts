import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatApiService {

  private counter = 0;

  constructor(private http: HttpClient) { }

  getResponse(messages: any[]) {
    this.counter++;

    const requestBody = {
      apiVersion: environment.apiVersion,
      model: environment.model,
      messages: messages
    };
    console.log("requestBody", requestBody);

    if (environment.useDummyData) {
      // read the dummy data from local file
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
    } else {
      // make an HTTP request
      const url = environment.apiUrl;

      return this.http.post(url, requestBody);
    }
  }

  private getJsonData(filePath: string): Observable<string> {
    return this.http.get(filePath).pipe(map((resp: any) => resp));
  }
}
