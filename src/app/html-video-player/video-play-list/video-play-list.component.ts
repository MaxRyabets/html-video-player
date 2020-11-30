import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { PlayList } from '../shared/play-list';
import { VideoPlayListService } from './video-play-list.service';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { VideoDuration } from '../shared/video-duration';

@Component({
  selector: 'app-video-play-list',
  templateUrl: './video-play-list.component.html',
  styleUrls: ['./video-play-list.component.scss'],
})
export class VideoPlayListComponent implements OnInit, OnDestroy {
  @Output() emitVideo: EventEmitter<PlayList> = new EventEmitter<PlayList>();
  @Output() emitDuration: EventEmitter<string> = new EventEmitter<string>();

  playList: PlayList[] = [];

  duration = '';

  destroy$ = new Subject();

  constructor(private videoPlayListService: VideoPlayListService) {}

  ngOnInit(): void {
    this.getPlayList();
  }

  private getPlayList(): void {
    this.videoPlayListService
      .getPlayList()
      .pipe(
        takeUntil(this.destroy$),
        tap((playList: PlayList[]) => {
          this.playList = playList;
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clickOnVideo(list: PlayList): void {
    this.emitVideo.emit(list);
  }

  calculateDuration(videoDuration: VideoDuration): void {
    this.playList.forEach((video) => {
      if (video.id === videoDuration.id) {
        video.duration = videoDuration.duration;
      }
    });
  }

  onClickVideo(duration: string): void {
    this.emitDuration.emit(duration);
  }
}
