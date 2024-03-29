import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import labels from '../labels';
import Dashboard from './dashboard';

export interface DashboardTimeHeaderProps {
  dashboard: Dashboard;
  field: 'start' | 'end';
}

function ten(i: number): string {
  return (i < 10 ? '0' : '') + i;
}

function toDatetimeLocalString(date: Date | undefined): string {
  if (date === undefined) {
    return '';
  }

  const YYYY = date.getFullYear();
  const MM = ten(date.getMonth() + 1);
  const DD = ten(date.getDate());
  const HH = ten(date.getHours());
  const II = ten(date.getMinutes());
  const SS = ten(date.getSeconds());
  return YYYY + '-' + MM + '-' + DD + 'T' + HH + ':' + II + ':' + SS;
}

export default function DashboardTimeHeader({
  dashboard,
  field,
}: DashboardTimeHeaderProps): React.ReactElement {
  const [time, setTime] = useState<Date>();
  if (time == null) {
    setTime(dashboard[field]);
  }

  function onTimeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const input = event.target.value;
    if (input != null) {
      const d = new Date(input);
      dashboard[field] = d;
      setTime(d);
    }
  }

  return (
    <>
      <label htmlFor={field}>{labels(field + 'Time')}</label>
      <input
        className="form-control"
        name={field}
        type="datetime-local"
        value={toDatetimeLocalString(time)}
        onChange={onTimeChange}
      />
    </>
  );
}
