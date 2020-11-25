import { AxisLeft } from '@visx/axis';
import React from 'react';
import { Tick } from './graph-area-chart';
import { ScaleLinear } from 'd3-scale';

function yTickLabelProps() {
  return {
    dx: '-0.5rem',
    dy: '0.25rem',
    fontSize: 12,
    fontFamily: 'sans-serif',
    textAnchor: 'end',
  } as const;
}

function yFormat(value: Tick): string {
  if (value instanceof Number) {
    return value.toFixed(2);
  } else if (value.valueOf != null) {
    return value.valueOf().toFixed(0);
  }
  return '';
}

export type GraphAxisProps = {
  scale: ScaleLinear<number, number>;
};

export default function GraphAxisVertical({
  scale,
}: GraphAxisProps): React.ReactElement {
  return (
    <AxisLeft
      axisClassName="graph-area-chart-axis"
      scale={scale}
      tickFormat={yFormat}
      tickClassName="graph-area-chart-tick"
      tickLabelProps={yTickLabelProps}
    />
  );
}
