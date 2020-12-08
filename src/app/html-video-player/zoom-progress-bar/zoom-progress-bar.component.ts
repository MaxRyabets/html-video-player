import {
  AfterViewInit,
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
    let x0;
    let point;

    const svg = d3
      .select(this.chartZoom.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('click', (event) => {
        const ticks = [];

        svg.selectAll('.tick').each((tick) => {
          ticks.push(tick);
        });

        x0 = x.invert(event.layerX);

        const bisect = d3.bisector((d) => d).right;
        const nearestTick = bisect(ticks, x0);
        point = ticks[nearestTick];

        this.emitOnClickTimeLine.emit(ticks[nearestTick].toString());

        if (line !== undefined) {
          line.remove();
        }

        line = svg
          .append('line')
          .attr('class', 'progress-line')
          .attr('x2', event.layerX);
      });

    /*line = svg.append('line').attr('class', 'progress-line');*/

    const gGrid = svg.append('g');

    const gx = svg.append('g').on('click', (d) => {
      this.emitOnClickTimeLine.emit(d.toElement.innerHTML);
    });

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    function zoomed({ transform }): void {
      const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);

      gx.call(xAxis, zx);
      gGrid.call(grid, zx);

      if (line === undefined) {
        return;
      }

      const ticks = [];

      svg.selectAll('.tick').each((currentTick) => {
        ticks.push(currentTick);
      });

      const bisect = d3.bisector((d) => d).right;

      const nearestPointAfterZoom = bisect(ticks, x0);

      const tick = svg
        .select(`.tick:nth-child(${nearestPointAfterZoom + 2})`)
        .node();

      console.log(
        svg.select(`.tick:nth-child(${nearestPointAfterZoom + 2})`).node(),
        nearestPointAfterZoom
      );

      // @ts-ignore
      const widthTick = tick.getCTM().e;

      console.log('nearestPointWithAfterZoom', nearestPointAfterZoom);

      if (ticks.includes(point)) {
        console.log('includes', ticks.includes(point));
        line.attr('x2', widthTick).style('stroke-width', 5);

        return;
      }

      console.log('not includes', ticks.includes(point));
      line.attr('x2', 0).style('stroke-width', 0);
    }

    return Object.assign(svg.node(), {
      reset(): void {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      },
    });
  }
}
