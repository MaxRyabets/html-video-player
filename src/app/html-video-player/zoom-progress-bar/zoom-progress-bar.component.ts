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

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): any {
    const zoom = d3
      .zoom()
      .scaleExtent([1, 32])
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
        const path = event.path;
        point = event;

        for (const gItem of path) {
          if (gItem.childNodes.length > 2) {
            const g = gItem.childNodes;

            console.log('CLICK', point);
            for (const item of g) {
              if (item.textContent === point.toElement.textContent) {
                console.log('After CLICK', point.toElement.textContent);
                if (line !== undefined) {
                  line.remove();
                }

                line = svg
                  .append('line')
                  .attr('class', 'progress-line')
                  .attr('x2', item.transform.animVal[0].matrix.e);
              }
            }

            break;
          }
        }
      })
      .on('mousedown', (event) => {
        /*if (line !== undefined && line._groups[0].length) {
          line.remove();
        }*/
        /*console.log('event', event.x);

        line = svg
          .append('line')
          .attr('class', 'progress-line')
          .attr('x2', event.x);*/
      });

    const gGrid = svg.append('g');

    const gx = svg.append('g').on('click', (d) => {
      this.emitOnClickTimeLine.emit(d.toElement.innerHTML);
      /*point = d;
      console.log('GX', gx);*/
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
      /*line.attr('width', gx._groups[0][0].width);*/
    }

    return Object.assign(svg.node(), {
      reset(): void {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      },
    });
  }
}
