import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HtmlVideoPlayerComponent } from './html-video-player/html-video-player.component';
import {ReactiveFormsModule} from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {OverlayModule} from '@angular/cdk/overlay';

@NgModule({
  declarations: [AppComponent, HtmlVideoPlayerComponent],
  imports: [BrowserModule, ReactiveFormsModule, NoopAnimationsModule, OverlayModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
