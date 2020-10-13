import Series, { SeriesMap } from './series';
import SeriesSegment from './series-segment';

function generateData(
  start: number,
  rate: number,
  points: number,
  min = 0,
  max = 100,
  spread = 10
): number[] {
  const data = [];
  const range = max - min - spread;

  let i = 0;
  while (i < points) {
    const base = (Math.sin(start + i * rate) + 1) * range;
    data.push(base + Math.random() * spread);
    i++;
  }
  return data;
}

function generateSeries(
  name: string,
  start: Date,
  end: Date,
  segments = 2,
  points = 100,
  min = 0,
  max = 100,
  spread = 10
): Series {
  const segs = [];
  const sinStart = Math.random() * 2 * Math.PI;
  const sinRate = Math.random() / 10;
  const values = generateData(
    sinStart,
    sinRate,
    points * segments,
    min,
    max,
    spread
  );
  const timeStep = (end.getTime() - start.getTime()) / segments;
  let i = 0;
  let segmentStart = start;
  let segmentEnd = new Date(start.getTime() + timeStep);
  while (i < segments) {
    segs.push(
      SeriesSegment.create({
        start: segmentStart,
        end: segmentEnd,
        values: values.slice(i * points, (i + 1) * points),
      })
    );
    segmentStart = segmentEnd;
    segmentEnd = new Date(segmentEnd.getTime() + timeStep);
    i++;
  }
  return new Series(name, segs, segments * points);
}

const seriesByName: SeriesMap = {
  a: generateSeries('a', new Date(2020, 9, 1), new Date(2020, 9, 2)),
  b: generateSeries('b', new Date(2020, 9, 1), new Date(2020, 9, 2)),
  c: generateSeries('c', new Date(2020, 9, 1), new Date(2020, 9, 2)),
};

export { seriesByName };
