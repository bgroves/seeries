import { AxisBottom } from '@visx/axis';
import React from 'react';
import { Tick } from './graph-area-chart';
import { ScaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';

function tickLabelProps() {
  return {
    fontSize: 12,
    fontFamily: 'sans-serif',
    textAnchor: 'end',
    dx: '.25rem',
    dy: '-.25rem',
    angle: -90,
  } as const;
}

function tickFormat(value: Tick): string {
  if (value instanceof Date) {
    return timeFormat('%m/%d %H:%M')(value);
  }

  return '';
}

export type GraphAxisHorizontalProps = {
  scale: ScaleTime<number, number>;
  top: number;
};

export default function GraphAxisHorizontal({
  scale,
  top,
}: GraphAxisHorizontalProps): React.ReactElement {
  return (
    <AxisBottom
      axisClassName="graph-area-chart-axis"
      top={top}
      scale={scale}
      tickFormat={tickFormat}
      tickClassName="graph-area-chart-tick"
      tickLabelProps={tickLabelProps}
    />
  );
}
