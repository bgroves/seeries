import { RectClipPath } from '@visx/clip-path';
import { GridColumns, GridRows } from '@visx/grid';
import { scaleLinear, scaleTime } from '@visx/scale';
import React, { useMemo } from 'react';
import GraphAxisHorizontal from './graph-axis-horizontal';
import GraphAxisVertical from './graph-axis-vertical';
import GraphChartLine from './graph-chart-line';
import GraphPoint from './graph-point';
import { GraphScale } from './graph-scale';
import GraphSeries from './graph-series';
import GraphWindow from './graph-window';

export type Tick = number | Date | { valueOf(): number };

// accessors
function getDate(d: GraphPoint): Date {
  return d.time;
}

function getValue(d: GraphPoint): number {
  return d.value;
}

export type AreaProps = {
  series: GraphSeries[];
  window: GraphWindow;
  scale: GraphScale;
  height: number;
  width: number;
  baseId: string;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default function GraphAreaChart({
  series,
  window,
  scale,
  width,
  height,
  baseId,
  margin = { top: 20, right: 20, bottom: 100, left: 60 },
}: AreaProps) {
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // scales
  const xScale = useMemo(
    () =>
      scaleTime({
        range: [0, xMax],
        domain: [window.start, window.end],
      }),
    [window, xMax]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [scale.min, scale.max],
        nice: true,
      }),
    [scale, yMax]
  );

  // This must come after any react hooks calls like useMemo
  if (xMax < 10 || yMax < 10) return null;

  function getX(d: GraphPoint): number {
    const n = xScale(getDate(d));
    return n == null ? 0 : n;
  }

  function getY(d: GraphPoint): number {
    const n = yScale(getValue(d));
    return n == null ? 0 : n;
  }

  const clipId = baseId + '_clip-path';

  return (
    <svg className="graph-area-chart" width={width} height={height}>
      <RectClipPath id={clipId} height={yMax} width={xMax} />
      <g transform={`translate(${margin.left},${margin.top})`}>
        <GridRows
          className="graph-area-chart-row"
          scale={yScale}
          width={xMax}
          strokeDasharray="3,3"
          strokeOpacity={0.3}
          pointerEvents="none"
        />
        <GridColumns
          className="graph-area-chart-col"
          scale={xScale}
          height={yMax}
          strokeDasharray="3,3"
          strokeOpacity={0.3}
          pointerEvents="none"
        />

        {series.map((series, seriesIndex) => {
          return series.chunks.map((chunk, chunkIndex) => {
            return (
              <GraphChartLine
                key={'series_' + seriesIndex + '_chunk_' + chunkIndex}
                clipId={clipId}
                chunk={chunk}
                getX={getX}
                getY={getY}
              />
            );
          });
        })}
        <GraphAxisVertical scale={yScale} />
        <GraphAxisHorizontal scale={xScale} top={yMax} />
      </g>
    </svg>
  );
}
