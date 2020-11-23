import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HtmlVideoPlayerComponent } from './html-video-player/html-video-player.component';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [AppComponent, HtmlVideoPlayerComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
