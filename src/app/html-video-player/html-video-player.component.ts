import { Component, OnInit, ViewChild } from '@angular/core';
import { VideoOptions } from './video-options.interface';

@Component({
  selector: 'app-html-video-player',
  templateUrl: './html-video-player.component.html',
  styleUrls: ['./html-video-player.component.scss'],
})
export class HtmlVideoPlayerComponent implements OnInit {
  readonly src = '../../assets/videos/movie.mp4';

  videoOptions: VideoOptions = {
    width: 500,
    height: 500,
    src: '../../assets/videos/movie.mp4',
    muted: 'muted',
  };

  @ViewChild('video') video;
  @ViewChild('progressBar') progressBar;

  progressValue = 0;

  constructor() {}

  ngOnInit(): void {}

  playPause(): void {
    if (this.video.nativeElement.paused) {
      this.video.nativeElement.play();
      this.progressValue = this.progressBar.nativeElement.value;

      return;
    }

    this.video.nativeElement.pause();
  }

  seek(event: MouseEvent): void {
    const percent = event.offsetX / this.video.nativeElement.offsetWidth;

    this.video.nativeElement.currentTime =
      percent * this.video.nativeElement.duration;

    const target = event.target as HTMLTextAreaElement;

    this.progressValue = Math.floor(percent * 100);
    target.innerHTML = this.progressBar.nativeElement.value + '% played';
  }

  updateProgressBar(): void {
    // Work out how much of the media has played via the duration and currentTime parameters
    const currentTimeVideoPlayed = Math.floor(
      (100 / this.video.nativeElement.duration) *
        this.video.nativeElement.currentTime
    );

    // Update the progress bar's value
    this.progressValue = currentTimeVideoPlayed;
    this.progressBar.nativeElement.innerHTML =
      currentTimeVideoPlayed + '% played';
  }
}
