import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HtmlVideoPlayerComponent} from './html-video-player/html-video-player.component';
import {ReactiveFormsModule} from '@angular/forms';
import { VideoPlayListComponent } from './html-video-player/video-play-list/video-play-list/video-play-list.component';

@NgModule({
  declarations: [AppComponent, HtmlVideoPlayerComponent, VideoPlayListComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
