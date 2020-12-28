import React from 'react';
import labels from '../labels';

export interface DatetimeFieldProps {
  value: Date;
  max?: Date;
  onChange: (d: Date) => void;
  field: string;
}

function ten(i: number): string {
  return (i < 10 ? '0' : '') + i;
}

function toDatetimeLocalString(date: Date | undefined): string | undefined {
  if (date === undefined) {
    return undefined;
  }

  const YYYY = date.getFullYear();
  const MM = ten(date.getMonth() + 1);
  const DD = ten(date.getDate());
  const HH = ten(date.getHours());
  const II = ten(date.getMinutes());
  const SS = ten(date.getSeconds());
  return YYYY + '-' + MM + '-' + DD + 'T' + HH + ':' + II + ':' + SS;
}

export default function DatetimeField({
  value,
  max,
  onChange,
  field,
}: DatetimeFieldProps): React.ReactElement {
  function onTimeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const input = event.target.value;
    if (input != null) {
      const d = new Date(input);
      onChange(d);
    }
  }

  let maxValue: Date | undefined =
    max === undefined ? undefined : new Date(max.getTime() - 100);
  return (
    <div className="form-group">
      <label htmlFor={field}>{labels(field)}</label>
      <input
        className="form-control"
        name={field}
        type="datetime-local"
        max={toDatetimeLocalString(maxValue)}
        value={toDatetimeLocalString(value)}
        onChange={onTimeChange}
      />
    </div>
  );
}
