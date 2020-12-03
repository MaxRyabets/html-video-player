import { AfterViewInit, Component, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-zoom-progress-bar',
  templateUrl: './zoom-progress-bar.component.html',
  styleUrls: ['./zoom-progress-bar.component.scss'],
})
export class ZoomProgressBarComponent implements AfterViewInit {
  @ViewChild('chart') chartZoom;

  chart: any;

  width = 954;
  height = 600;

  k = this.height / this.width;

  data = this.createData();

  ngAfterViewInit(): void {
    this.chart = this.createChart();
  }

  createData(): any[] {
    const random = d3.randomNormal(0, 0.2);
    const sqrt3 = Math.sqrt(3);
    return [].concat(
      Array.from({ length: 300 }, () => [random() + sqrt3, random() + 1, 0]),
      Array.from({ length: 300 }, () => [random() - sqrt3, random() + 1, 1]),
      Array.from({ length: 300 }, () => [random(), random() - 1, 2])
    );
  }

  private createChart(): any {
    const zoom = d3.zoom().scaleExtent([0.5, 32]).on('zoom', zoomed);

    const x = d3.scaleLinear().domain([-4.5, 4.5]).range([0, this.width]);

    const y = d3
      .scaleLinear()
      .domain([-4.5 * this.k, 4.5 * this.k])
      .range([this.height, 0]);

    const z = d3
      .scaleOrdinal()
      .domain(this.data.map((d) => d[2]))
      .range(d3.schemeCategory10);

    const xAxis = (g, currentX) =>
      g
        .attr('transform', `translate(0,${this.height})`)
        .call(d3.axisTop(currentX).ticks(12))
        .call((c) => c.select('.domain').attr('display', 'none'));

    const yAxis = (g, currentY) =>
      g
        .call(d3.axisRight(currentY).ticks(12 * this.k))
        .call((c) => c.select('.domain').attr('display', 'none'));

    const grid = (g, currentX, currentY) =>
      g
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.1)
        .call((c) =>
          c
            .selectAll('.x')
            .data(currentX.ticks(12))
            .join(
              (enter) =>
                enter.append('line').attr('class', 'x').attr('y2', this.height),
              (update) => update,
              (exit) => exit.remove()
            )
            .attr('x1', (d) => 0.5 + currentX(d))
            .attr('x2', (d) => 0.5 + currentX(d))
        )
        .call((c) =>
          c
            .selectAll('.y')
            .data(currentY.ticks(12 * this.k))
            .join(
              (enter) =>
                enter.append('line').attr('class', 'y').attr('x2', this.width),
              (update) => update,
              (exit) => exit.remove()
            )
            .attr('y1', (d) => 0.5 + currentY(d))
            .attr('y2', (d) => 0.5 + currentY(d))
        );

    const svg = d3
      .select(this.chartZoom.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const gGrid = svg.append('g');

    // @ts-ignore
    const gDot: any = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .selectAll('path')
      .data(this.data)
      .join('path')
      .attr('d', (d) => `M${x(d[0])},${y(d[1])}h0`)
      .attr('stroke', (d) => z(d[2]));

    const gx = svg.append('g');

    const gy = svg.append('g');

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    function zoomed({ transform }): void {
      const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
      const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
      gDot.attr('transform', transform).attr('stroke-width', 5 / transform.k);
      gx.call(xAxis, zx);
      gy.call(yAxis, zy);
      gGrid.call(grid, zx, zy);
    }

    return Object.assign(svg.node(), {
      reset(): void {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      },
    });
  }
}
