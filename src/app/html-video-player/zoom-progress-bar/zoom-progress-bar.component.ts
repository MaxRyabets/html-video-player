import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-zoom-progress-bar',
  templateUrl: './zoom-progress-bar.component.html',
  styleUrls: ['./zoom-progress-bar.component.scss'],
})
export class ZoomProgressBarComponent implements AfterViewInit {
  @ViewChild('chart') chartZoom;

  @Input() duration;

  width = 700;
  height = 20;

  k = this.height / this.width;

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): any {
    const zoom = d3
      .zoom()
      .scaleExtent([1, 32])
      .translateExtent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('zoom', zoomed);

    console.log('duration', this.duration);

    const x = d3
      .scaleLinear()
      .domain([-1, this.duration])
      .range([0, this.width]);

    const xAxis = (g, currentX) =>
      g
        .attr('transform', `translate(0,${this.height})`)
        .call(d3.axisTop(currentX).ticks(12))
        .call((c) => c.select('.domain').attr('display', 'none'));

    const grid = (g, currentX) =>
      g
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.1)
        .call((c) =>
          c
            .selectAll('.x')
            .data(currentX.ticks(25))
            .join(
              (enter) =>
                enter.append('line').attr('class', 'x').attr('y2', this.height),
              (update) => update,
              (exit) => exit.remove()
            )
            .attr('x1', (d) => 0.5 + currentX(d))
            .attr('x2', (d) => 0.5 + currentX(d))
        );

    const svg = d3
      .select(this.chartZoom.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const gDot = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .selectAll('path')
      .join('path')
      .attr('d', (d) => `M${x(d[0])}`);

    const gGrid = svg.append('g');

    const gx = svg.append('g');

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    function zoomed({ transform }): void {
      const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
      gDot.attr('transform', transform).attr('stroke-width', 5 / transform.k);

      gx.call(xAxis, zx);
      gGrid.call(grid, zx);
    }

    return Object.assign(svg.node(), {
      reset(): void {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      },
    });
  }
}
