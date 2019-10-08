import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebsocketService } from './websocket.service';
import {map} from 'rxjs/operators';
import { environment } from '../environments/environment';

const TEMPERATURES_URL = 'ws://localhost:1337/';

export interface Message {
  type: string;
  name: string;
  coordinates: Array<any>;
}

@Injectable({
  providedIn: 'root'
})
export class TemperaturesService {
  /**
   * List of messages of channel
   */
  public messages: Subject<Message>;

  /**
   * Constructor of TemperaturesService
   */
  constructor(wsService: WebsocketService) {
    // Every message must be mapped into a channel message
    this.messages = wsService.connect(`wss://${environment.app_url}:${environment.websocket_port}`).pipe(map(
      (response: MessageEvent): Message => {
        // Parse string data
        const data = JSON.parse(response.data);
        return {
          type: data.type,
          name: data.name,
          coordinates: data.coordinates
        };
      }
    )) as Subject<Message>;
  }
}
