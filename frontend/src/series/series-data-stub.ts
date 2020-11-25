import Series from './series';
import SeriesID from './series-id';
import SeriesSegment from './series-segment';
import SeriesMap from './series-map';

const officeIds = {
  avgTemp: new SeriesID('office', 'celsius', 'AVG'),
};

const atticIds = {
  avgTemp: new SeriesID('attic', 'celsius', 'AVG'),
};

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
  id: SeriesID,
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
      SeriesSegment.create(
        {
          start: segmentStart,
          end: segmentEnd,
          points: values.slice(i * points, (i + 1) * points),
        },
        points
      )
    );
    segmentStart = segmentEnd;
    segmentEnd = new Date(segmentEnd.getTime() + timeStep);
    i++;
  }
  return new Series(id, points, segs);
}

function genSeries(map: SeriesMap, id: SeriesID, start: Date, end: Date): void {
  map.put(id, Promise.resolve(generateSeries(id, start, end)));
}

const seriesByName = new SeriesMap();
genSeries(
  seriesByName,
  officeIds['avgTemp'],
  new Date(2020, 9, 1),
  new Date(2020, 9, 2)
);
genSeries(
  seriesByName,
  officeIds['avgTemp'],
  new Date(2020, 9, 1),
  new Date(2020, 9, 2)
);
genSeries(
  seriesByName,
  atticIds['avgTemp'],
  new Date(2020, 9, 1),
  new Date(2020, 9, 2)
);

export { seriesByName };
