import React from 'react';
import { Col } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import { useNavigation } from 'react-navi';
import CheckboxField from '../ui/checkbox-field';
import RawDatetimeField from '../ui/datetime-field';

export interface DashboardDetailFormProps {
  start: Date;
  onStartChange: (d: Date) => void;
  onEndChange: (d: Date) => void;
  onLiveChange: (b: boolean) => void;
  end: Date;
  name: string;
  live: boolean;
}

export default function DashboardDetail({
  start,
  onStartChange,
  onEndChange,
  onLiveChange,
  end,
  name,
  live,
}: DashboardDetailFormProps): React.ReactElement {
  const navigation = useNavigation();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (start !== undefined || end !== undefined) {
      navigation.navigate(
        '/dashboards/' +
          name +
          '?start=' +
          start.toISOString() +
          '&end=' +
          end.toISOString()
      );
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Row>
        <Col sm={6} lg={4}>
          <RawDatetimeField
            value={start}
            max={end}
            onChange={onStartChange}
            field="start"
          />
        </Col>
        <Col sm={6} lg={4}>
          <RawDatetimeField value={end} onChange={onEndChange} field="end" />
        </Col>
        <Col sm={12} lg={4}>
          <div className="align-bottom">
            <CheckboxField value={live} onChange={onLiveChange} field="live" />
          </div>
        </Col>
      </Row>
    </form>
  );
}
