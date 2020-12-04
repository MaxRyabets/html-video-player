import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-zoom-progress-bar',
  templateUrl: './zoom-progress-bar.component.html',
  styleUrls: ['./zoom-progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoomProgressBarComponent implements AfterViewInit {
  @ViewChild('chart') chartZoom;

  @Input() duration;
  @Output()
  emitOnClickTimeLine: EventEmitter<string> = new EventEmitter<string>();

  width = 700;
  height = 30;

  k = this.height / this.width;
  private rememberLastPoint: any;

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): any {
    const initGrid = [];

    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [7, 0],
        [this.width, this.height],
      ])
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('zoom', zoomed);

    const x = d3
      .scaleLinear()
      .domain([-1, this.duration])
      .range([0, this.width]);

    const xAxis = (g, currentX) =>
      g
        .attr('transform', `translate(0,${this.height})`)
        .attr('class', 'chart-line')
        .call(d3.axisTop(currentX).ticks(12))
        .call((c) => c.select('.domain').attr('display', 'none'));

    const grid = (g, currentX) =>
      g.call((c) => c.selectAll('.x').data(currentX.ticks(12)));

    let line;
    let point;

    const svg = d3
      .select(this.chartZoom.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('click', (event) => {
        if (line !== undefined) {
          line.remove();
        }

        line = svg
          .append('line')
          .attr('class', 'progress-line')
          .attr('x2', this.rememberLastPoint);
      });

    const gGrid = svg.append('g');

    const gx = svg.append('g').on('click', (d) => {
      this.emitOnClickTimeLine.emit(d.toElement.innerHTML);
      point = d;

      const path = d.path;

      for (const gItem of path) {
        if (gItem.childNodes.length > 2) {
          const g = gItem.childNodes;

          for (const item of g) {
            if (item.textContent === d.toElement.textContent) {
              if (+item.textContent % 10 === 0) {
                this.rememberLastPoint = item.transform.animVal[0].matrix.e;
              }
              console.log('rememberLastPoint', this.rememberLastPoint);

              line = svg
                .append('line')
                .attr('class', 'progress-line')
                .attr('x2', item.transform.animVal[0].matrix.e);
            }
          }

          break;
        }
      }

      /*console.log('rememberLastPoint', this.rememberLastPoint);*/
    });

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    function zoomed({ transform }): void {
      const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);

      gx.call(xAxis, zx);
      gGrid.call(grid, zx);

      if (point !== undefined) {
        // @ts-ignore
        const g = gx._groups[0][0].childNodes;

        for (const item of g) {
          if (item.textContent === point.toElement.textContent) {
            console.log('ZOOM', point.toElement.textContent);
            line.remove();
            line = svg
              .append('line')
              .attr('class', 'progress-line')
              .attr('x2', item.transform.animVal[0].matrix.e);
          }
        }
      }
    }

    return Object.assign(svg.node(), {
      reset(): void {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      },
    });
  }
}
