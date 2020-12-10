import { Injectable } from '@angular/core';
import { PlayList } from '../shared/play-list';
import { playList } from './mock-play-list';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoPlayListService {
  private playList: PlayList[] = playList;

  getPlayList(): Observable<PlayList[]> {
    return of<PlayList[]>(this.playList);
  }

  removeById(id): Observable<PlayList[]> {
    return of<PlayList[]>(playList.filter((list) => list.id !== id));
  }
}
