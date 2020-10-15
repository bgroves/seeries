import { trackPromise } from 'react-promise-tracker';
import { SeriesMap } from './series';
import { seriesByName } from './series-data-stub';

function getSeries(
  start: Date,
  end: Date,
  points: number,
  series: string[]
): Promise<SeriesMap> {
  const found: SeriesMap = {};
  for (const k of series) {
    const it = seriesByName[k];
    if (it != null) {
      found[k] = seriesByName[k].windowedBy({ start: start, end: end });
    }
  }

  return trackPromise(
    new Promise((resolve) => {
      window.setTimeout(() => {
        resolve(found);
      }, 0);
    })
  );
}

export { getSeries };
