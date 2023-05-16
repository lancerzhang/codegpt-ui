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
      apiVersion: environment.apiVersion,
      model: environment.model,
      messages: messages
    };
    console.log("requestBody", requestBody);

    this.scheduleLogout();

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

  scheduleLogout() {
    // clear any existing timer
    if (this.logoutTimer) {
      this.logoutTimer.unsubscribe();
    }

    // schedule new timer
    this.logoutTimer = timer(25 * 60 * 1000)  // 25 minutes
      .pipe(take(1))  // take once
      .subscribe(() => {
        this.logout();
      });
  }

  logout() {
    // call your logout URL here
    const url = environment.logoutUrl;
    this.http.get(url).subscribe(() => {
      console.log('Logged out after 25 minutes of inactivity');
    }, (error) => {
      console.error('Error during logout:', error);
    });
  }
}
