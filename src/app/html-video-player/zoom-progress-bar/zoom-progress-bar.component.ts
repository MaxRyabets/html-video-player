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
      .range([0, this.width + 2]);

    const xAxis = (g, currentX) =>
      g
        .attr('transform', `translate(0,${this.height})`)
        .attr('class', 'chart-line')
        .call(d3.axisTop(currentX).ticks(12))
        .call((c) => c.select('.domain').attr('display', 'none'));

    const grid = (g, currentX) =>
      g.call((c) => c.selectAll('.x').data(currentX.ticks(12)));

    let line;
    let tick;
    let widthTick;
    const widthGrid = this.width;

    const svg = d3
      .select(this.chartZoom.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('click', (event) => {});

    const gGrid = svg.append('g');

    const gx = svg.append('g').on('click', (event) => {
      this.emitOnClickTimeLine.emit(event.toElement.innerHTML);

      const ticks = [];

      svg.selectAll('.tick').each((currentTick) => {
        ticks.push(currentTick);
      });

      const textContentTick = +event.toElement.textContent;

      const tickIndex = ticks.findIndex(
        (currentTick) => currentTick === textContentTick
      );
      tick = ticks[tickIndex];

      this.emitOnClickTimeLine.emit(tick.toString());

      if (line !== undefined) {
        line.remove();
      }

      line = svg
        .append('line')
        .attr('class', 'progress-line')
        .attr('x2', event.layerX);
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

      let nearestPointAfterZoom = ticks.findIndex(
        (currentTick) => currentTick === tick
      );

      if (nearestPointAfterZoom === -1) {
        const closestRightTick = Math.min(
          ...ticks.filter((currentTick) => currentTick > tick)
        );

        const closestLeftTick = Math.max(
          ...ticks.filter((currentTick) => currentTick < tick)
        );

        if (closestLeftTick === -Infinity) {
          line.attr('x2', 0).style('stroke-width', 0);
          return;
        }

        if (closestRightTick === Infinity) {
          line.attr('x2', widthGrid);
          return;
        }

        const differentTickRight = closestRightTick - tick;
        const differentTickLeft = tick - closestLeftTick;

        const foundIndexNearestTick =
          differentTickRight <= differentTickLeft
            ? closestRightTick
            : closestLeftTick;

        nearestPointAfterZoom = ticks.findIndex(
          (currentTick) => currentTick === foundIndexNearestTick
        );

        tick = foundIndexNearestTick;
      }

      const foundTickNode = svg
        .select(`.tick:nth-child(${nearestPointAfterZoom + 2})`)
        .node();

      // @ts-ignore
      widthTick = foundTickNode.getCTM().e;
      line.attr('x2', widthTick).style('stroke-width', 5);
    }

    return Object.assign(svg.node(), {
      reset(): void {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      },
    });
  }
}
