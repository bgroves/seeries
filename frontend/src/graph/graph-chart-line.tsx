import { curveMonotoneX } from '@visx/curve';
import { LinePath } from '@visx/shape';
import { CurveFactory, CurveFactoryLineOnly } from 'd3-shape';
import React, { useEffect, useState } from 'react';
import GraphChunk from './graph-chunk';
import GraphPoint from './graph-point';

export type GraphChartLineProps = {
  chunk: Promise<GraphChunk>;
  clipId: string;
  getX: (input: GraphPoint) => number;
  getY: (input: GraphPoint) => number;
  curve?: CurveFactory | CurveFactoryLineOnly;
};

export default function GraphChartLine({
  chunk,
  clipId,
  getX,
  getY,
  curve = curveMonotoneX,
}: GraphChartLineProps): React.ReactElement {
  const [loadedChunk, setLoadedChunk] = useState<GraphChunk>();

  useEffect(() => {
    chunk.then((loaded) => {
      setLoadedChunk(loaded);
    });
  });

  return loadedChunk == null ? (
    <div>Loading...</div>
  ) : (
    <LinePath<GraphPoint>
      clipPath={'url(#' + clipId + ')'}
      className="graph-chart-line"
      data={loadedChunk.points}
      x={getX}
      y={getY}
      strokeWidth={1}
      curve={curve}
    />
  );
}
