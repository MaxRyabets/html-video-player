import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { VideoOptions } from './video-options.interface';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { bufferCount, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Timestamp } from './timestamp';
import { PlayList } from './shared/play-list';

@Component({
  selector: 'app-html-video-player',
  templateUrl: './html-video-player.component.html',
  styleUrls: ['./html-video-player.component.scss'],
})
export class HtmlVideoPlayerComponent
  implements OnInit, AfterViewInit, OnDestroy {
  private startSegment: number;
  private endSegment: number;

  isDisabledLoopVideoSegment = false;
  isFullScreen = false;
  isOpenPopupOtherControls = false;
  isPlay = false;
  isMute = false;

  zoom = 1;

  destroy$ = new Subject();

  // for local src ../../assets/videos/movie.mp4
  videoOptions: VideoOptions = {
    width: 700,
    height: 300,
    src: 'http://html5videoformatconverter.com/data/images/happyfit2.mp4',
    muted: '',
    poster: '',
  };

  @ViewChild('containerVideoElement') containerVideoElement;
  @ViewChild('video') video;
  @ViewChild('progressBarVideo') progressBarVideo;
  @ViewChild('loopSegment') loopSegment;
  @ViewChild('playPause') playPause;
  @ViewChild('bufferedAmount') bufferedAmount;
  @ViewChild('canvas') canvas;
  @ViewChild('videoControls') videoControls;
  @ViewChild('videoPlayList', { read: ElementRef }) videoPlayList;

  progressBarVideoValue = 0;
  progressBarVolumeValue = 1;

  hours = 0;
  minutes = 0;
  seconds = 0;
  duration = '';
  currentTime = '';

  ngOnInit(): void {}

  get videoElement(): any {
    return this.video.nativeElement;
  }

  get progressVideo(): any {
    return this.progressBarVideo.nativeElement;
  }

  get containerVideo(): any {
    return this.containerVideoElement.nativeElement;
  }

  get controls(): any {
    return this.videoControls.nativeElement;
  }

  muteVolume(): void {
    if (this.videoElement.muted && this.progressBarVolumeValue >= 0) {
      this.videoElement.muted = false;
      this.isMute = this.videoElement.muted;
      this.progressBarVolumeValue = 1;

      return;
    }

    this.progressBarVolumeValue = 0;
    this.videoElement.muted = true;
    this.isMute = this.videoElement.muted;
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

  zoomIn(): void {
    if (this.zoom > 2) {
      return;
    }
    this.zoom += 0.1;

    // number of increase pixels
    const pixel = 20;

    this.changeMarginTopAfterZoom(pixel);
  }

  zoomOut(): void {
    if (this.zoom === 1) {
      return;
    }
    this.zoom -= 0.1;

    // number of degrease pixels
    const pixel = -20;

    this.changeMarginTopAfterZoom(pixel);
  }

  ngAfterViewInit(): void {
    const popupOtherControls$ = this.clickOnPopupOtherControls();

    const loopSegment$ = this.clickOnLoopSegment();

    const playPause$ = this.clickOnPlayPause$();

    const progressBarIfVideoOnPause$ = this.clickOnProgressBarIfVideoOnPause();

    const updateProgressBar$ = this.timeUpdateProgressBar();

    const replaceVideoFromPlayList$ = this.clickOnVideoPlayList();

    merge(
      popupOtherControls$,
      loopSegment$,
      playPause$,
      progressBarIfVideoOnPause$,
      updateProgressBar$,
      replaceVideoFromPlayList$
    ).subscribe();
  }

  changePropertiesVideo(video: PlayList): void {
    this.videoOptions.src = video.videoOptions.src;
    this.videoOptions.poster = video.videoOptions.poster;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateTime(timestamp): Timestamp {
    const hours = Math.floor(timestamp / 60 / 60);
    const minutes = Math.floor(timestamp / 60) - hours * 60;
    const seconds = Math.floor(timestamp % 60);

    return {
      hours,
      minutes,
      seconds,
    };
  }

  private calculateDuration(): void {
    const timestamp = this.videoElement.duration;

    const timeVideoPlayed = this.calculateTime(timestamp);
    let hours = timeVideoPlayed.hours;

    this.duration = [
      timeVideoPlayed.minutes.toString().padStart(2, '0'),
      timeVideoPlayed.seconds.toString().padStart(2, '0'),
    ].join(':');

    if (hours === 0) {
      return;
    }

    hours = hours.toString().padStart(2, '0') + ':';
    this.duration = hours + this.duration;
  }

  private calculateCurrentTime(timeVideoPlayed: Timestamp): void {
    let { hours, minutes, seconds } = timeVideoPlayed;

    if (seconds < 10) {
      seconds = seconds.toString().padStart(2, '0');
    }

    if (minutes < 10) {
      minutes = minutes.toString().padStart(2, '0');
    }

    if (hours < 10) {
      hours = hours.toString().padStart(2, '0');
    }

    this.currentTime = `${
      hours !== '00' ? hours + ':' : ''
    }${minutes}:${seconds}`;
  }

  private updateTimeVideo(currentTimeVideoPlayed: number): void {
    const timeVideoPlayed = this.calculateTime(currentTimeVideoPlayed);
    this.calculateCurrentTime(timeVideoPlayed);
  }

  private clickOnProgressBarAfterStartLoopSegment(): Observable<MouseEvent> {
    return fromEvent(this.progressVideo, 'click').pipe(
      takeUntil(this.destroy$),
      tap(() => {
        if (this.startSegment === undefined) {
          this.startSegment = this.videoElement.currentTime;
        }
      }),
      bufferCount(2),
      tap((e: any) => {
        if (!this.isInitStartSegment(this.startSegment)) {
          return;
        }

        this.endSegment = this.videoElement.currentTime;

        if (this.endSegment < this.startSegment) {
          [this.startSegment, this.endSegment] = [
            this.endSegment,
            this.startSegment,
          ];
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

  private changeMarginTopAfterZoom(pixel: number): void {
    this.videoElement.style.transform = `scale(${this.zoom})`;

    const marginTopControls =
      (+this.controls.style.marginTop.replace('px', '') + pixel).toString() +
      'px';

    this.controls.style.marginTop = marginTopControls;
    this.videoElement.style.marginTop = marginTopControls;
  }

  private clickOnPopupOtherControls(): Observable<MouseEvent> {
    return fromEvent(document, 'click').pipe(
      takeUntil(this.destroy$),
      filter(() => this.isOpenPopupOtherControls),
      tap((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const popupOtherControls = document.querySelector(
          '.popupOtherControls'
        );
        const activePopupOtherControls = document.querySelector(
          '.active-popup-other-controls'
        );

        if (
          !activePopupOtherControls.contains(target) &&
          !popupOtherControls.contains(target)
        ) {
          this.isOpenPopupOtherControls = false;
        }
      })
    );
  }

  private clickOnLoopSegment(): Observable<MouseEvent> {
    return fromEvent(this.loopSegment.nativeElement, 'click').pipe(
      takeUntil(this.destroy$),
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
  }

  private clickOnPlayPause$(): Observable<MouseEvent> {
    return fromEvent(this.playPause.nativeElement, 'click').pipe(
      takeUntil(this.destroy$),
      tap((e: MouseEvent) => {
        if (!this.duration.length) {
          this.calculateDuration();
        }

        if (this.videoElement.paused) {
          this.play();

          return;
        }

        this.pause();
      })
    );
  }

  private clickOnProgressBarIfVideoOnPause(): Observable<MouseEvent> {
    return fromEvent(this.progressVideo, 'click').pipe(
      takeUntil(this.destroy$),
      tap((event: MouseEvent) => {
        if (!this.duration.length) {
          this.calculateDuration();
        }

        const percent = event.offsetX / this.videoElement.offsetWidth;

        this.videoElement.currentTime = percent * this.videoElement.duration;
        this.progressBarVideoValue = Math.floor(percent * 100);

        this.updateTimeVideo(this.progressBarVideoValue);

        const target = event.target as HTMLTextAreaElement;
        target.innerHTML = this.progressVideo.value + '% played';
      })
    );
  }

  private timeUpdateProgressBar(): Observable<Timestamp> {
    return fromEvent(this.videoElement, 'timeupdate').pipe(
      takeUntil(this.destroy$),
      tap((e: Timestamp) => {
        if (this.isClickLoopSegment()) {
          this.videoElement.currentTime = this.startSegment;
        }

        if (this.videoElement.paused) {
          return;
        }

        // Work out how much of the media has played via the duration and currentTime parameters
        const currentTimeVideoPlayed = Math.floor(
          (100 / this.videoElement.duration) * this.videoElement.currentTime
        );

        if (isNaN(currentTimeVideoPlayed)) {
          return;
        }

        this.progressBarVideoValue = currentTimeVideoPlayed;
        this.progressVideo.innerHTML = currentTimeVideoPlayed + '% played';

        this.updateTimeVideo(currentTimeVideoPlayed);
      })
    );
  }

  private clickOnVideoPlayList(): Observable<MouseEvent> {
    return fromEvent(this.videoPlayList.nativeElement, 'click').pipe(
      takeUntil(this.destroy$),
      tap((e: MouseEvent) => {
        this.pause();

        this.videoElement.currentTime = 0;
        this.progressVideo.innerHTML = '0% played';
        this.progressBarVideoValue = this.progressVideo.value = 0;

        this.play();
      })
    );
  }

  private isClickLoopSegment(): boolean {
    return (
      this.isDisabledLoopVideoSegment &&
      this.videoElement.currentTime > this.endSegment
    );
  }
}
