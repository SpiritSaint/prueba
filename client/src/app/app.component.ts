import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {TemperaturesService} from './temperatures.service';
import { WebsocketService } from './websocket.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ WebsocketService, TemperaturesService ]
})
export class AppComponent {
  title = 'Temperaturas';
  coordinates = [];

  /**
   * Constructor of AppComponent
   */
  constructor(private http: HttpClient, private temperaturesService: TemperaturesService) {
    // Subscribe for new data
    temperaturesService.messages.subscribe(msg => {
      // New data must be refresh local data
      this.coordinates = msg.coordinates;
    });
  }

  /**
   * Method ask for data to WS
   */
  askForData() {
    // Send a refresh locations action
    this.temperaturesService.messages.next({
      type: 'action',
      name: 'refreshLocations',
      coordinates: []
    });
  }

  /**
   * Method on init Angular Component
   */
  ngOnInit() {
    // Data must be fetched at start
    this.fetchData();

    // Interval must be created to ask locations
    setInterval(() => {
      this.askForData();
    }, 10000);
  }

  /**
   * Method fetch data to API
   */
  fetchData() {
    // Create a GET request to API
    this.http.get(`https://${environment.app_url}:${environment.backend_port}`).subscribe((data) => {
      // If response has status key, it's a error
      if (data.hasOwnProperty('status')) {
        // So fetch again the response
        this.fetchData();
      } else {
        // If no coordinates are retrieved
        if (!data.hasOwnProperty('coordinates')) {
          // Fetch again the response
          this.fetchData();
        } else {
          // Set local coordinates variable
          // @ts-ignore
          this.coordinates = data.coordinates;
        }
      }
    });
  }

  calculateTime(coordinate) {
    return new Date(coordinate.time.time * 1000).toLocaleString('en-US', {timeZone: coordinate.time.zone});
  }
}
