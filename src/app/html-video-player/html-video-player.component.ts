import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { VideoOptions } from './video-options.interface';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { bufferCount, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Timestamp } from './timestamp';
import { PlayList } from './shared/play-list';
import { VideoDuration } from './shared/video-duration';

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

  destroy$ = new Subject();

  // for local src ../../assets/videos/movie.mp4
  videoOptions: VideoOptions = {
    width: 700,
    height: 400,
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
  @ViewChild('timelineTr') timelineTr;

  progressBarVideoValue = 0;
  progressBarVolumeValue = 1;

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

  calculateDurationAfterFirstInitVideo(videoDuration: VideoDuration): void {
    this.duration = videoDuration.duration;
  }

  ngAfterViewInit(): void {
    const popupOtherControls$ = this.clickOnPopupOtherControls();

    const loopSegment$ = this.clickOnLoopSegment();

    const playPause$ = this.clickOnPlayPause();

    const progressBarIfVideoOnPause$ = this.clickOnProgressBarIfVideoOnPause();

    const updateProgressBar$ = this.timeUpdateProgressBar();

    /*const replaceVideoFromPlayList$ = this.clickOnVideoPlayList();*/

    const videoPlayer$ = this.clickOnVideoPlayer();

    merge(
      popupOtherControls$,
      loopSegment$,
      playPause$,
      progressBarIfVideoOnPause$,
      updateProgressBar$,

      videoPlayer$
    ).subscribe();
  }

  changePropertiesVideo(video: PlayList): void {
    this.videoOptions.src = video.videoOptions.src;
    this.videoOptions.poster = video.videoOptions.poster;
    this.duration = video.duration;

    console.log('video', video);

    this.startPlayVideoOfPlayList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateTime(timestamp): Timestamp {
    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor((timestamp % 3600) / 60);
    const seconds = Math.floor((timestamp % 3600) % 60);

    return {
      hours,
      minutes,
      seconds,
    };
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

  private clickOnVideoPlayer(): Observable<MouseEvent> {
    return fromEvent(this.videoElement, 'click').pipe(
      takeUntil(this.destroy$),
      tap((e: MouseEvent) => {
        this.changeActionPlayPause();
      })
    );
  }

  private clickOnPlayPause(): Observable<MouseEvent> {
    return fromEvent(this.playPause.nativeElement, 'click').pipe(
      takeUntil(this.destroy$),
      tap((e: MouseEvent) => {
        this.changeActionPlayPause();
      })
    );
  }

  private clickOnProgressBarIfVideoOnPause(): Observable<MouseEvent> {
    return fromEvent(this.progressVideo, 'click').pipe(
      takeUntil(this.destroy$),
      tap((event: MouseEvent) => {
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
        if (
          Math.floor(this.videoElement.currentTime) ===
          Math.floor(this.videoElement.duration)
        ) {
          this.updateTimeVideo(this.videoElement.duration);

          this.pause();
        }

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

        this.updateTimeVideo(this.videoElement.currentTime);
      })
    );
  }

  private isClickLoopSegment(): boolean {
    return (
      this.isDisabledLoopVideoSegment &&
      this.videoElement.currentTime > this.endSegment
    );
  }

  private changeActionPlayPause(): void {
    if (this.videoElement.paused) {
      this.play();

      return;
    }

    this.pause();
  }

  private startPlayVideoOfPlayList(): void {
    this.pause();

    this.videoElement.play().then((_) => {
      this.videoElement.currentTime = 0;
      this.progressVideo.innerHTML = '0% played';
      this.progressBarVideoValue = this.progressVideo.value = 0;
      this.play();
    });
  }
}
