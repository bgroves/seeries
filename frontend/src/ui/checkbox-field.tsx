import React from 'react';
import labels from '../labels';

export interface CheckboxFieldProps {
  value: boolean;
  onChange: (b: boolean) => void;
  field: string;
}

export default function CheckboxField({
  value,
  onChange,
  field,
}: CheckboxFieldProps): React.ReactElement {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const input = !!event.target.checked;
    onChange(input);
  }

  return (
    <div className="form-group">
      <div className="form-check">
        <input
          className="form-check-input"
          name={field}
          id={field}
          type="checkbox"
          checked={value}
          onChange={handleChange}
        />
        <label htmlFor={field} className="form-check-label">
          {labels(field)}
        </label>
      </div>
    </div>
  );
}
