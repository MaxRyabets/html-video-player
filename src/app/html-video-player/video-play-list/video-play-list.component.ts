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

  onClickVideo(video: PlayList): void {
    this.emitVideo.emit(video);
  }

  calculateDuration(videoDuration: VideoDuration): void {
    this.playList.forEach((video) => {
      if (video.id === videoDuration.id) {
        video.duration = videoDuration.duration;
      }
    });
  }

  remove(id: number): void {
    this.videoPlayListService
      .removeById(id)
      .pipe(
        tap((playList) => {
          this.playList = playList;
        })
      )
      .subscribe();
  }

  uploadFile(event: any): void {
    let eventFile = event;

    // for import tasks (input file)
    if (event.target !== undefined) {
      eventFile = eventFile.target.files[0];
      console.log('eventFile', eventFile);
    }

    const request = window.indexedDB.open('DatabaseStorage', 3);

    request.onerror = (e) => {
      alert('Database error: ' + event.target.errorCode);
    };

    request.onupgradeneeded = (e: Event) => {
      // @ts-ignore
      const db = e.target.result as IDBDatabase;

      if (!db.objectStoreNames.contains('videos')) {
        const objectStore = db.createObjectStore('videos', { keyPath: 'id' });

        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.createIndex('width', 'width', { unique: false });
        objectStore.createIndex('height', 'height', { unique: false });
        objectStore.createIndex('src', 'src', { unique: false });
        objectStore.createIndex('muted', 'muted', { unique: false });
      }
    };

    request.onsuccess = (e: Event) => {
      console.log('onsuccess', e);
      // @ts-ignore
      const db = e.target.result as IDBDatabase;

      db.onversionchange = () => {
        db.close();
        alert('The database is out of date, please reload the page.');
      };

      const reader = new FileReader();
      reader.readAsArrayBuffer(event);
      reader.onload = (ev) => {
        console.log('eve', ev);
        const store = db.transaction(['videos'], 'readwrite');
        /*const req = store.put(data, 'blob');*/
      };
    };
  }
}
