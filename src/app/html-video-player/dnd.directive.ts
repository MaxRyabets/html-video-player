import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  OnDestroy,
  Output,
} from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Directive({
  selector: '[appDnd]',
})
export class DndDirective implements AfterViewInit, OnDestroy {
  @Output() fileDropped: EventEmitter<any> = new EventEmitter<any>();
  @HostBinding('class.file-over') fileOver: boolean;
  destroy$ = new Subject();

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    const dragAndDropEvents = ['dragover', 'dragleave', 'drop'];
    const dragAndDrop$ = dragAndDropEvents.map((ev) =>
      fromEvent(this.elementRef.nativeElement, ev).pipe(
        takeUntil(this.destroy$),
        tap((dragEvent: DragEvent) => {
          dragEvent.preventDefault();
          dragEvent.stopPropagation();

          if (ev === 'dragover' || ev === 'dragleave') {
            this.changeFileOver(ev, dragEvent);
          }

          if (this.shouldDropEvent(ev, dragEvent)) {
            this.fileOver = false;
            this.fileDropped.emit(dragEvent.dataTransfer.files[0]);
          }
        })
      )
    );
    merge(...dragAndDrop$).subscribe();
  }

  private shouldDropEvent(ev: string, dragEvent: DragEvent): boolean {
    return ev === 'drop' && dragEvent.dataTransfer.files.length > 0;
  }

  private shouldDragOver(ev: string, dragEvent: DragEvent, element): boolean {
    return (
      ev === 'dragover' &&
      dragEvent.x >= element.offsetLeft &&
      dragEvent.x <= element.offsetWidth + element.offsetLeft &&
      dragEvent.y >= element.offsetTop &&
      dragEvent.y <= element.offsetHeight + element.offsetTop
    );
  }

  private shouldDragLeave(ev: string, dragEvent: DragEvent, element): boolean {
    return (
      (ev === 'dragleave' && dragEvent.x <= element.offsetLeft) ||
      dragEvent.x >= element.offsetWidth + element.offsetLeft ||
      dragEvent.y <= element.offsetTop ||
      dragEvent.y >= element.offsetHeight + element.offsetTop
    );
  }

  private changeFileOver(ev: string, dragEvent: DragEvent): void {
    const element = {
      offsetWidth: this.elementRef.nativeElement.offsetWidth,
      offsetLeft: this.elementRef.nativeElement.offsetLeft,
      offsetHeight: this.elementRef.nativeElement.offsetHeight,
      offsetTop: this.elementRef.nativeElement.offsetTop,
    };

    if (this.shouldDragOver(ev, dragEvent, element)) {
      this.fileOver = true;
    }

    if (this.shouldDragLeave(ev, dragEvent, element)) {
      this.fileOver = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
