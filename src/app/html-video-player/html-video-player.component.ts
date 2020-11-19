import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-html-video-player',
  templateUrl: './html-video-player.component.html',
  styleUrls: ['./html-video-player.component.scss'],
})
export class HtmlVideoPlayerComponent implements OnInit {
  readonly src = '../../assets/videos/movie.mp4';

  @ViewChild('video') video;
  @ViewChild('progressBar') progressBar;

  constructor() {}

  ngOnInit(): void {}

  playPause(): void {
    if (this.video.nativeElement.paused) {
      this.video.nativeElement.play();

      return;
    }

    this.video.nativeElement.pause();
  }

  seek(event: MouseEvent): void {
    const percent = event.offsetX / this.video.nativeElement.offsetWidth;

    this.video.nativeElement.currentTime =
      percent * this.video.nativeElement.duration;

    const target = event.target as HTMLTextAreaElement;
    target.value = String(Math.floor(percent * 100));
    target.innerHTML = this.progressBar.nativeElement.value + '% played';
  }
}
