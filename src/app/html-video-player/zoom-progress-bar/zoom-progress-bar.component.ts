import { AfterViewInit, Component, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-zoom-progress-bar',
  templateUrl: './zoom-progress-bar.component.html',
  styleUrls: ['./zoom-progress-bar.component.scss'],
})
export class ZoomProgressBarComponent implements AfterViewInit {
  @ViewChild('chart') chartZoom;

  cx: any;
  cy: any;

  options = {
    xmax: 60,
    xmin: 0,
    ymax: 40,
    ymin: 0,
    title: 'Simple Graph1',
    xlabel: 'X Axis',
    ylabel: 'Y Axis',
  };

  padding = {
    top: this.options.title ? 40 : 20,
    right: 30,
    bottom: this.options.xlabel ? 60 : 10,
    left: this.options.ylabel ? 70 : 45,
  };

  size: any;

  x: any;
  y: any;

  downx = NaN;
  downy = NaN;

  dragged = null;
  selected = null;

  line: any;

  points: any;

  xrange = this.options.xmax - this.options.xmin;
  yrange2 = (this.options.ymax - this.options.ymin) / 2;
  yrange4 = this.yrange2 / 2;
  datacount: any;

  vis: any;
  plot: any;

  getPoints(): any {
    return d3.range(this.datacount).map((i) => {
      return {
        x: (i * this.xrange) / this.datacount,
        y: this.options.ymin + this.yrange4 + Math.random() * this.yrange2,
      };
    });
  }

  ngAfterViewInit(): void {
    this.cx = this.chartZoom.nativeElement.clientWidth;
    this.cy = this.chartZoom.nativeElement.clientHeight;

    this.size = {
      width: this.cx - this.padding.left - this.padding.right,
      height: this.cy - this.padding.top - this.padding.bottom,
    };

    this.x = d3
      .scaleLinear()
      .domain([this.options.xmin, this.options.xmax])
      .range([0, this.size.width]);

    this.y = d3
      .scaleLinear()
      .domain([this.options.ymax, this.options.ymin])
      .nice()
      .range([0, this.size.height])
      .nice();

    this.datacount = this.size.width / 30;

    this.line = d3
      .line()
      .x((d, i) => {
        return this.x(this.points[i].x);
      })
      .y((d, i) => {
        return this.y(this.points[i].y);
      });

    this.points = this.getPoints();

    this.vis = d3
      .select(this.chartZoom.nativeElement)
      .append('svg')
      .attr('width', this.cx)
      .attr('height', this.cy)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.padding.left + ',' + this.padding.top + ')'
      );

    this.plot = this.vis
      .append('rect')
      .attr('width', this.size.width)
      .attr('height', this.size.height)
      .style('fill', '#EEEEEE')
      .attr('pointer-events', 'all');

    this.plot.call(d3.zoom().scaleExtent([1, 100]).on('zoom', this.redraw()));

    this.vis
      .append('svg')
      .attr('top', 0)
      .attr('left', 0)
      .attr('width', this.size.width)
      .attr('height', this.size.height)
      .attr('viewBox', '0 0 ' + this.size.width + ' ' + this.size.height)
      .attr('class', 'line')
      .append('path')
      .attr('class', 'line')
      .attr('d', this.line(this.points));

    d3.select(this.chartZoom.nativeElement);
  }

  redraw(): any {
    return () => {
      const tx = (d) => {
        console.log('test', 'translate(' + this.x(d) + ',0)');
        return 'translate(' + this.x(d) + ',0)';
      };

      const stroke = (d) => {
        return d ? '#ccc' : '#666';
      };
      const fx = this.x.tickFormat(10);

      // Regenerate x-ticks…
      const gx = this.vis
        .selectAll('g.x')
        .data(this.x.ticks(10), String)
        .attr('transform', tx);

      gx.select('text').text(fx);

      const gxe = gx
        .enter()
        .insert('g', 'a')
        .attr('class', 'x')
        .attr('transform', tx);

      gxe
        .append('line')
        .attr('stroke', stroke)
        .attr('y1', 0)
        .attr('y2', this.size.height);

      gxe
        .append('text')
        .attr('class', 'axis')
        .attr('y', this.size.height)
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .text(fx)
        .style('cursor', 'ew-resize');

      gx.exit().remove();
    };
  }
}
