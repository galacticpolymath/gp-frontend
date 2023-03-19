/* eslint-disable no-console */
/* eslint-disable quotes */
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function ChunkGraph({ durList, chunkNum }) {
  const container = useRef();

  useEffect(() => {
    update();
  }, []);

  console.log("update: ", update);

  function update() {
    /**
     * 1 bar space for each minute, width is 900
     * (barSpacing + 3px gap) * minutes = 900
     */
    const svgWidth = 900;
    const plotDisplace = 15;
    const width = svgWidth - 5;
    const height = 70 + plotDisplace;

    let svg = d3
      .select(container.current)
      .append('svg')
      .attr('viewBox', `0 0 ${svgWidth} ${height}`)
      .classed('svg-content-responsive', true);

    const barHeight = 30;
    // gap on either side of the axis before first/last ticks
    const endGap = 15;
    // total minutes
    const minutes = durList.reduce((a, b) => a + b, 0);
    const gap = 1;
    const barSpacing = (width - endGap * 2) / minutes - gap;
    // array of ints 0:minutes
    const range = [...Array(minutes + 1).keys()];

    // x coords for every bar and tick
    let xcoords = [];
    for (let i = 0; i < minutes + 1; i++) {
      xcoords[i] = range[i] * barSpacing + gap * i + endGap;
    }

    // x coords for numbers
    let numCoords = [];
    for (let i = 0; i < minutes + 1; i++) {
      if (i % 5 === 0 && i < 10) {
        numCoords.push({ value: i, coord: xcoords[i] });
      }
      if (i % 5 === 0 && i >= 10) {
        numCoords.push({ value: i, coord: xcoords[i] - 4 });
      }
    }

    // AXIS
    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', plotDisplace + barHeight + 10)
      .attr('width', width)
      .attr('height', 2)
      .attr('style', 'fill:rgb(0,0,0)')
      .attr('class', 'axis');

    // TICK MARKS
    svg
      .selectAll('rect.tick')
      .data(xcoords)
      .enter()
      .append('rect')
      .attr('x', (d) => d)
      .attr('y', plotDisplace + 43)
      .attr('width', 2)
      .attr('height', 7)
      .attr('style', 'fill:rgb(0,0,0)')
      .attr('class', 'tick');

    // NUMBERS
    svg
      .selectAll('text')
      .data(numCoords)
      .enter()
      .append('text')
      .attr('x', (d) => d.coord - 6)
      .attr('y', plotDisplace + 70)
      .attr('stroke', 'none')
      .attr('style', 'fill:rgb(0,0,0)')
      .attr('font-weight', 'bold')
      .attr('class','chunkGraphAxisLabels')
      .text((d) => d.value);

    // GRAY BARS
    let pastduration = 0;

    for (let i = 0; i < chunkNum; i++) {
      pastduration += durList[i];
    }

    svg
      .selectAll('rect.darkbar')
      .data(xcoords.slice(0, pastduration))
      .enter()
      .append('rect')
      .attr('x', (d) => d + 2 + gap / 2)
      .attr('y', plotDisplace + barHeight + 2)
      .attr('width', barSpacing - gap)
      .attr('height', 8)
      .attr('style', 'fill:rgb(30,79,116)')
      .attr('class', 'darkbar');

    // BLUE BARS
    const currentDuration = durList[chunkNum];
    const blueCoords = xcoords.slice(
      pastduration,
      pastduration + currentDuration
    );

    svg
      .selectAll('rect.lightbar')
      .data(blueCoords)
      .enter()
      .append('rect')
      .attr('x', (d) => d + 2 + gap / 2)
      .attr('y', plotDisplace + 25)
      .attr('width', barSpacing - gap)
      .attr('height', 15)
      .attr('style', 'fill:rgb(50,132,193)')
      .attr('class', 'lightbar');

    const anchorPoint = [
      (blueCoords[blueCoords.length - 1] - blueCoords[0] + barSpacing) / 2 +
        blueCoords[0],
    ];

    svg
      .selectAll('text.title')
      .data(anchorPoint)
      .enter()
      .append('text')
      .attr('x', anchorPoint[0] + 2 + gap / 2)
      .attr('y', plotDisplace + 17)
      .attr('style', 'fill:rgb(50,132,193);font-weight:bold;')
      .text(`${currentDuration} min.`)
      .attr('text-anchor', 'middle')
      .attr('font-family', '"Montserrat", "Helvetica", "Arial", sans-serif')
      .attr('class','chunkGraphTimeLabel');

  }

  return <div ref={container} />;
}
