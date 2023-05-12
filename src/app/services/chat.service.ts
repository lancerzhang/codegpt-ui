import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor() { }

  getResponse(inputMessage: string): Observable<string> {
    const mockResponse = 'This is a mock response for: ' + inputMessage;
    return of(mockResponse).pipe(delay(1000)); // Simulate a 1-second delay to mimic server response time
  }
}
