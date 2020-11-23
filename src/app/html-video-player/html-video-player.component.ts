import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { VideoOptions } from './video-options.interface';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import {
  bufferCount,
  skip,
  skipWhile,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'app-html-video-player',
  templateUrl: './html-video-player.component.html',
  styleUrls: ['./html-video-player.component.scss'],
})
export class HtmlVideoPlayerComponent implements AfterViewInit, OnDestroy {
  private isLoopVideoSegment = false;
  private startSegment: number;
  private endSegment: number;

  destroy$ = new Subject();

  // for local src ../../assets/videos/movie.mp4
  videoOptions: VideoOptions = {
    width: 500,
    height: 500,
    src: 'http://html5videoformatconverter.com/data/images/happyfit2.mp4',
    muted: 'muted',
  };

  @ViewChild('video') video;
  @ViewChild('progressBar') progressBar;
  @ViewChild('loopSegment') loopSegment;
  @ViewChild('playPause') playPause;

  progressBarValue = 0;

  get videoElement(): any {
    return this.video.nativeElement;
  }

  get progressVideo(): any {
    return this.progressBar.nativeElement;
  }

  seek(event: MouseEvent): void {
    const percent = event.offsetX / this.videoElement.offsetWidth;

    this.videoElement.currentTime = percent * this.videoElement.duration;

    const target = event.target as HTMLTextAreaElement;

    this.progressBarValue = Math.floor(percent * 100);
    target.innerHTML = this.progressVideo.value + '% played';
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
    const clickOnLoopSegment$ = fromEvent(
      this.loopSegment.nativeElement,
      'click'
    ).pipe(
      tap(() => {
        if (this.isLoopVideoSegment) {
          this.isLoopVideoSegment = false;

          return;
        }

        this.isLoopVideoSegment = true;
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
          this.videoElement.play();
          this.playPause.nativeElement.innerHTML = '❙❙';

          if (this.isInitSegments()) {
            this.videoElement.currentTime = this.startSegment;
          }

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
          this.isLoopVideoSegment &&
          this.videoElement.currentTime >= this.endSegment
        ) {
          this.videoElement.currentTime = this.startSegment;
        }

        if (!this.videoElement.paused) {
          // Work out how much of the media has played via the duration and currentTime parameters
          const currentTimeVideoPlayed = Math.floor(
            (100 / this.videoElement.duration) * this.videoElement.currentTime
          );

          this.progressBarValue = currentTimeVideoPlayed;
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
        if (
          this.isInitSegment(this.startSegment) &&
          this.endSegment === undefined
        ) {
          this.endSegment = this.videoElement.currentTime;
        }

        /*if (this.isInitSegments()) {
          this.isLoopVideoSegment = false;
        }*/

        console.log(
          'startSegment',
          this.startSegment,
          'endSegment',
          this.endSegment
        );
      })
    );
  }

  private pause(): void {
    this.videoElement.pause();
    this.playPause.nativeElement.innerHTML = '►';
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
