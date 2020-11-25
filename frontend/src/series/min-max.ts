import { GraphScale } from '../graph/graph-scale';

export default class MinMax implements GraphScale {
  private _min: number;
  private _max: number;

  constructor({
    min = Number.MAX_VALUE,
    max = Number.MIN_VALUE,
  }: { min?: number; max?: number } = {}) {
    this._min = min;
    this._max = max;
  }

  get max(): number {
    return this._max;
  }

  get min(): number {
    return this._min;
  }

  extend(input: GraphScale): MinMax {
    if (input.max > this._max) {
      this._max = input.max;
    }

    if (input.min < this._min) {
      this._min = input.min;
    }
    return this;
  }

  update(input: number): MinMax {
    if (input > this._max) {
      this._max = input;
    }
    if (input < this._min) {
      this._min = input;
    }
    return this;
  }
}
