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

  get videoElement(): any {
    return this.video.nativeElement;
  }

  get progressVideo(): any {
    return this.progressBar.nativeElement;
  }

  playPause(): void {
    if (this.videoElement.paused) {
      this.videoElement.play();
      this.progressValue = this.progressVideo.value;

      return;
    }

    this.video.nativeElement.pause();
  }

  seek(event: MouseEvent): void {
    const percent = event.offsetX / this.videoElement.offsetWidth;

    this.videoElement.currentTime = percent * this.videoElement.duration;

    const target = event.target as HTMLTextAreaElement;

    this.progressValue = Math.floor(percent * 100);
    target.innerHTML = this.progressVideo.value + '% played';
  }

  updateProgressBar(): void {
    // Work out how much of the media has played via the duration and currentTime parameters
    const currentTimeVideoPlayed = Math.floor(
      (100 / this.videoElement.duration) * this.videoElement.currentTime
    );

    // Update the progress bar's value
    this.progressValue = currentTimeVideoPlayed;
    this.progressVideo.innerHTML = currentTimeVideoPlayed + '% played';
  }

  muteVolume(): void {
    if (this.videoElement.muted) {
      this.videoElement.muted = '';

      return;
    }

    this.videoElement.muted = 'muted';
  }
}
