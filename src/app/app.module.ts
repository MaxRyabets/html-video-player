import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HtmlVideoPlayerComponent } from './html-video-player/html-video-player.component';
import { ReactiveFormsModule } from '@angular/forms';
import { VideoPlayListComponent } from './html-video-player/video-play-list/video-play-list.component';
import { CalculateTimeVideoDirective } from './html-video-player/calculate-time-video.directive';
import { DndDirective } from './html-video-player/dnd.directive';

@NgModule({
  declarations: [
    AppComponent,
    HtmlVideoPlayerComponent,
    VideoPlayListComponent,
    VideoPlayListComponent,
    CalculateTimeVideoDirective,
    DndDirective,
  ],
  imports: [BrowserModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
