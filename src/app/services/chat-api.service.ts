import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { delay, map, switchMap, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatApiService {

  private logoutTimer: any;
  private counter = 0;

  constructor(private http: HttpClient) {

    this.scheduleLogout();
  }

  getResponse(messages: any[]) {
    this.counter++;

    const requestBody = {
      messages: messages
    };
    console.log("requestBody", requestBody);

    this.scheduleLogout();

    if (environment.production) {
      // make an HTTP request
      const url = `${environment.apiBase}/chat/completions`;

      return this.http.post(url, requestBody);
    } else {
      // read the dummy data from local file
      const jsonFile1 = 'assets/dummy/chat-response-1.json';
      const jsonFile2 = 'assets/dummy/chat-response-2.json';
      const jsonFile3 = 'assets/dummy/chat-response-3.json';
      const jsonFile4 = 'assets/dummy/chat-response-4.json';
      const jsonFile5 = 'assets/dummy/chat-response-5.json';

      return of(this.counter).pipe(
        delay(1000),
        switchMap(counter => {
          switch (counter % 5) {
            case 1:
              return this.getJsonData(jsonFile1);
            case 2:
              return this.getJsonData(jsonFile2);
            case 3:
              return this.getJsonData(jsonFile3);
            case 4:
              return this.getJsonData(jsonFile4);
            default:
              return this.getJsonData(jsonFile5);
          }
        })
      );
    }
  }

  private getJsonData(filePath: string): Observable<string> {
    return this.http.get(filePath).pipe(map((resp: any) => resp));
  }

  scheduleLogout() {
    // clear any existing timer
    if (this.logoutTimer) {
      this.logoutTimer.unsubscribe();
    }

    // schedule new timer
    this.logoutTimer = timer(25 * 60 * 1000)  // 25 minutes
      .pipe(take(1))  // take once
      .subscribe(() => {
        // make keep alive call
      });
  }
}
