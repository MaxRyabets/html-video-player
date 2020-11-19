import {Component, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-html-video-player',
  templateUrl: './html-video-player.component.html',
  styleUrls: ['./html-video-player.component.scss']
})
export class HtmlVideoPlayerComponent implements OnInit {

  readonly src = '../../assets/videos/movie.mp4';

  @ViewChild('video') video;

  constructor() { }

  ngOnInit(): void {
  }


  playPause(): void {
    if (this.video.nativeElement.paused) {
      this.video.nativeElement.play();

      return;
    }

    this.video.nativeElement.pause();
  }
}
