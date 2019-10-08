import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { WebsocketService } from './websocket.service';
import { TemperaturesService } from './temperatures.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    WebsocketService,
    TemperaturesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
