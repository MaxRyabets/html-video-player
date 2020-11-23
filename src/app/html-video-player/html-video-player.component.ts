import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { VideoOptions } from './video-options.interface';
import { fromEvent, merge, Observable } from 'rxjs';
import {
  bufferCount,
  filter,
  skipWhile,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'app-html-video-player',
  templateUrl: './html-video-player.component.html',
  styleUrls: ['./html-video-player.component.scss'],
})
export class HtmlVideoPlayerComponent implements OnInit, AfterViewInit {
  private isLoopVideoSegment = false;
  private startSegment: number;
  private endSegment: number;

  videoOptions: VideoOptions = {
    width: 500,
    height: 500,
    src: '../../assets/videos/movie.mp4',
    muted: 'muted',
  };

  @ViewChild('video') video;
  @ViewChild('progressBar') progressBar;
  @ViewChild('loopSegment') loopSegment;

  progressValue = 0;

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

  fullScreen(): void {
    this.videoElement.requestFullscreen();
  }

  ngAfterViewInit(): void {
    fromEvent(this.loopSegment.nativeElement, 'click')
      .pipe(
        tap(() => {
          if (this.isLoopVideoSegment) {
            this.isLoopVideoSegment = false;

            return;
          }

          this.isLoopVideoSegment = true;

          this.videoElement.pause();
        }),
        switchMap(() => this.clickOnProgressBarAfterStartLoopSegment())
      )
      .subscribe();
  }

  clickOnProgressBarAfterStartLoopSegment(): Observable<unknown[]> {
    return fromEvent(this.progressVideo, 'click').pipe(
      tap(() => {
        if (this.startSegment === undefined) {
          this.startSegment = this.videoElement.currentTime;
        }
      }),
      bufferCount(2),
      tap(() => {
        if (
          this.isInitSegment(this.startSegment) &&
          this.endSegment === undefined
        ) {
          this.endSegment = this.videoElement.currentTime;
        }

        if (this.isInitSegments()) {
          this.isLoopVideoSegment = false;
        }

        console.log(
          'startSegment',
          this.startSegment,
          'endSegment',
          this.endSegment
        );
      })
    );
  }

  private saveStartEndSegments(): void {
    if (this.startSegment === undefined) {
      this.startSegment = this.videoElement.currentTime;
    }

    if (
      this.isInitSegment(this.startSegment) &&
      this.endSegment === undefined
    ) {
      this.endSegment = this.videoElement.currentTime;
    }

    if (this.isInitSegments()) {
      this.isLoopVideoSegment = false;
    }
  }

  private isInitSegment(segment: number): boolean {
    return typeof segment === 'number' && !isNaN(segment);
  }

  private isInitSegments(): boolean {
    return (
      this.isInitSegment(this.startSegment) &&
      this.isInitSegment(this.endSegment)
    );
  }
}
