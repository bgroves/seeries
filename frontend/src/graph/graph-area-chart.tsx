import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { GridColumns, GridRows } from '@visx/grid';
import { scaleLinear, scaleTime } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { timeFormat } from 'd3-time-format';
import React, { useMemo } from 'react';
import SeriesPoint from '../series/series-point';
import GraphSeries from './graph-series';

export const background = '#3b6978';
export const background2 = '#204051';
export const accentColor = '#edffea';
export const accentColorDark = '#75daad';
const axisColor = '#fff';
const tickLabelColor = '#fff';

const tickLabelProps = () =>
  ({
    fill: tickLabelColor,
    fontSize: 12,
    fontFamily: 'sans-serif',
    textAnchor: 'end',
    dx: '.25rem',
    dy: '-.25rem',
    angle: -90,
  } as const);

const yTickLabelProps = () =>
  ({
    fill: tickLabelColor,
    dx: '-0.5rem',
    dy: '0.25rem',
    fontSize: 12,
    fontFamily: 'sans-serif',
    textAnchor: 'end',
  } as const);

type Tick = number | Date | { valueOf(): number };

const tickFormat = (value: Tick): string => {
  if (value instanceof Date) {
    return timeFormat('%m/%d %H:%M')(value);
  }
  return '';
};

const yFormat = (value: Tick): string => {
  if (value instanceof Number) {
    return value.toFixed(2);
  } else if (value.valueOf != null) {
    return value.valueOf().toFixed(0);
  }
  return '';
};

// accessors
function getDate(d: SeriesPoint): Date {
  return d.time;
}

function getValue(d: SeriesPoint): number {
  return d.value;
}

export type AreaProps = {
  data: GraphSeries;
  height: number;
  width: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default function GraphAreaChart({
  data,
  width,
  height,
  margin = { top: 20, right: 20, bottom: 100, left: 60 },
}: AreaProps) {
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const dashboardWindow = {
    start: data.start,
    end: data.end,
  };

  const graphScaleWindow = {
    min: data.min,
    max: data.max,
  };

  // scales
  const xScale = useMemo(
    () =>
      scaleTime({
        range: [0, xMax],
        domain: [dashboardWindow.start, dashboardWindow.end],
      }),
    [dashboardWindow, xMax]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [graphScaleWindow.min, graphScaleWindow.max],
        nice: true,
      }),
    [graphScaleWindow, yMax]
  );

  // This must come after any react hooks calls like useMemo
  if (width < 10) return null;

  function getX(d: SeriesPoint): number {
    const n = xScale(getDate(d));
    return n == null ? 0 : n;
  }

  function getY(d: SeriesPoint): number {
    const n = yScale(getValue(d));
    return n == null ? 0 : n;
  }

  return (
    <svg width={width} height={height}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="url(#area-background-gradient)"
        rx={14}
      />
      <g transform={`translate(${margin.left},${margin.top})`}>
        <LinearGradient
          id="area-background-gradient"
          from={background}
          to={background2}
        />
        <LinearGradient
          id="area-gradient"
          from={accentColor}
          to={accentColor}
          toOpacity={0.1}
        />
        <GridRows
          scale={yScale}
          width={xMax}
          strokeDasharray="3,3"
          stroke={accentColor}
          strokeOpacity={0.3}
          pointerEvents="none"
        />
        <GridColumns
          scale={xScale}
          height={yMax}
          strokeDasharray="3,3"
          stroke={accentColor}
          strokeOpacity={0.3}
          pointerEvents="none"
        />

        {data.series.map((series) => {
          return series.segments.map((segment, i) => {
            return (
              <LinePath<SeriesPoint>
                key={'segment_' + i}
                data={segment.points}
                x={getX}
                y={getY}
                stroke="#fff"
                strokeWidth={1}
                curve={curveMonotoneX}
              />
            );
          });
        })}
        <AxisLeft
          scale={yScale}
          tickFormat={yFormat}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={yTickLabelProps}
        />

        <AxisBottom
          top={yMax}
          scale={xScale}
          tickFormat={tickFormat}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={tickLabelProps}
        />
      </g>
    </svg>
  );
}
