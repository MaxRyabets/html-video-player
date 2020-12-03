import { AfterViewInit, Component, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-zoom-progress-bar',
  templateUrl: './zoom-progress-bar.component.html',
  styleUrls: ['./zoom-progress-bar.component.scss'],
})
export class ZoomProgressBarComponent implements AfterViewInit {
  @ViewChild('chart') chartZoom;

  width = 700;
  height = 20;

  k = this.height / this.width;

  data = this.createData();

  ngAfterViewInit(): void {
    this.createChart();
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
            .data(currentX.ticks(12))
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

    const gGrid = svg.append('g');

    const gDot: any = svg
      .append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(this.data)
      .join('path');

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
