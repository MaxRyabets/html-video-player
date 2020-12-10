import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Timestamp } from './timestamp';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';
import { VideoDuration } from './shared/video-duration';

@Directive({
  selector: '[appCalculateTimeVideo]',
})
export class CalculateTimeVideoDirective implements AfterViewInit, OnDestroy {
  @Input('appCalculateTimeVideo') video;
  @Input() videoId;
  @Output()
  calcDuration: EventEmitter<VideoDuration> = new EventEmitter<VideoDuration>();
  duration = '';
  currentTime = '';

  destroy$ = new Subject();

  ngAfterViewInit(): void {
    this.initCalculateDuration();
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
    const videoDuration: VideoDuration = {
      id: this.videoId,
      duration: '',
    };

    const timestamp = this.video.duration;

    const timeVideoPlayed = this.calculateTime(timestamp);
    let hours = timeVideoPlayed.hours;

    this.duration = [
      timeVideoPlayed.minutes.toString().padStart(2, '0'),
      timeVideoPlayed.seconds.toString().padStart(2, '0'),
    ].join(':');

    if (hours === 0) {
      videoDuration.duration = this.duration;
      this.calcDuration.emit(videoDuration);

      return;
    }

    hours = hours.toString().padStart(2, '0') + ':';
    this.duration = hours + this.duration;
    videoDuration.duration = this.duration;

    this.calcDuration.emit(videoDuration);
  }

  private initCalculateDuration(): void {
    fromEvent(window, 'load')
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(200),
        tap(() => {
          this.calculateDuration();
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
