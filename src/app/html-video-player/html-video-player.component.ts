import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { VideoOptions } from './video-options.interface';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { bufferCount, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-html-video-player',
  templateUrl: './html-video-player.component.html',
  styleUrls: ['./html-video-player.component.scss'],
})
export class HtmlVideoPlayerComponent implements AfterViewInit, OnDestroy {
  private isDisabledLoopVideoSegment = false;
  private startSegment: number;
  private endSegment: number;
  private isFullScreen = false;

  isOpen = false;
  isPlay = false;

  destroy$ = new Subject();

  // for local src ../../assets/videos/movie.mp4
  videoOptions: VideoOptions = {
    width: 700,
    height: 300,
    src: 'http://html5videoformatconverter.com/data/images/happyfit2.mp4',
    muted: '',
  };

  @ViewChild('containerVideoElement') containerVideoElement;
  @ViewChild('video') video;
  @ViewChild('progressBarVideo') progressBarVideo;
  @ViewChild('loopSegment') loopSegment;
  @ViewChild('playPause') playPause;
  @ViewChild('canvas') canvas;

  progressBarVideoValue = 0;
  progressBarVolumeValue = 1;

  get videoElement(): any {
    return this.video.nativeElement;
  }

  get progressVideo(): any {
    return this.progressBarVideo.nativeElement;
  }

  get containerVideo(): any {
    return this.containerVideoElement.nativeElement;
  }

  setProgressVideoValue(event: MouseEvent): void {
    const target = event.target as HTMLTextAreaElement;
    this.videoElement.currentTime = target.value;
    this.progressBarVideoValue = +target.value;
  }

  muteVolume(): void {
    if (this.videoElement.muted && this.progressBarVolumeValue >= 0) {
      this.videoElement.muted = false;

      return;
    }

    this.videoElement.muted = true;
  }

  fullScreen(): void {
    if (!this.isFullScreen) {
      this.containerVideo.requestFullscreen();
      this.isFullScreen = true;

      return;
    }

    this.isFullScreen = false;
    document.exitFullscreen();
  }

  changeVolume(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.videoElement.volume = target.value;
  }

  snapshot(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');

    this.canvas.nativeElement.width = this.videoOptions.width;
    this.canvas.nativeElement.height = this.videoOptions.height;

    ctx.fillRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );

    ctx.drawImage(
      this.videoElement,
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
  }

  ngAfterViewInit(): void {
    const clickOnLoopSegment$ = fromEvent(
      this.loopSegment.nativeElement,
      'click'
    ).pipe(
      tap(() => {
        if (this.isDisabledLoopVideoSegment) {
          this.isDisabledLoopVideoSegment = false;

          this.startSegment = undefined;
          this.endSegment = undefined;

          return;
        }

        this.isDisabledLoopVideoSegment = true;
        this.pause();
      }),
      switchMap(() => this.clickOnProgressBarAfterStartLoopSegment())
    );

    const clickOnPlayPause$ = fromEvent(
      this.playPause.nativeElement,
      'click'
    ).pipe(
      tap(() => {
        if (this.videoElement.paused) {
          this.play();

          return;
        }

        this.pause();
      })
    );

    const timeUpdateProgressBar$ = fromEvent(
      this.videoElement,
      'timeupdate'
    ).pipe(
      tap(() => {
        if (
          this.isDisabledLoopVideoSegment &&
          this.videoElement.currentTime > this.endSegment
        ) {
          this.videoElement.currentTime = this.startSegment;
        }

        if (!this.videoElement.paused) {
          // Work out how much of the media has played via the duration and currentTime parameters
          const currentTimeVideoPlayed = Math.floor(
            (100 / this.videoElement.duration) * this.videoElement.currentTime
          );

          this.progressBarVideoValue = currentTimeVideoPlayed;
          this.progressVideo.innerHTML = currentTimeVideoPlayed + '% played';
        }
      })
    );

    merge(
      clickOnLoopSegment$,
      clickOnPlayPause$,
      timeUpdateProgressBar$
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private clickOnProgressBarAfterStartLoopSegment(): Observable<unknown[]> {
    return fromEvent(this.progressVideo, 'click').pipe(
      takeUntil(this.destroy$),
      tap(() => {
        if (this.startSegment === undefined) {
          this.startSegment = this.videoElement.currentTime;
        }
      }),
      bufferCount(2),
      tap(() => {
        if (this.isInitStartSegment(this.startSegment)) {
          this.endSegment = this.videoElement.currentTime;
        }
      })
    );
  }

  private pause(): void {
    this.videoElement.pause();
    this.isPlay = false;
  }

  private play(): void {
    this.videoElement.play();
    this.isPlay = true;
  }

  private isInitStartSegment(segment: number): boolean {
    return (
      typeof segment === 'number' &&
      !isNaN(segment) &&
      this.endSegment === undefined
    );
  }
}
