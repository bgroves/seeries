export interface GraphWindow {
  start: Date;
  end: Date;
}

export function intersects(a: GraphWindow, b: GraphWindow): boolean {
  return (
    (a.start >= b.start && a.start < b.end) ||
    (a.end > b.start && a.end <= b.end)
  );
}
