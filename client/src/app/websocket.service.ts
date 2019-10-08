import { Injectable } from '@angular/core';
import * as Rx from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  /**
   * Channel
   */
  private subject: Rx.Subject<MessageEvent>;

  /**
   * Method connect to WebSocket server
   */
  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
  }

  /**
   * Method create WebSocket connection
   */
  private create(url): Rx.Subject<MessageEvent> {
    // Instance of websocket must be created
    const ws = new WebSocket(url);

    // Create RxJs Observable binding methods
    const observable = Rx.Observable.create((obs: Rx.Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    // Create observer next method
    const observer = {
      next: (data) => {
        // If WebSocket connection is opened send the data request
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        } else {
          // Sometimes, not always, readyState isn't already opened
          // In those cases by adding a timeout fix the issue
          setTimeout(() => {
            ws.send(JSON.stringify(data));
          }, 500);
        }
      }
    };
    return Rx.Subject.create(observer, observable);
  }
}
