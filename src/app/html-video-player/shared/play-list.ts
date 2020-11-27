import { VideoOptions } from '../video-options.interface';

export interface PlayList {
  id: number;
  title: string;
  duration?: string;
  videoOptions?: VideoOptions;
}
