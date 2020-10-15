CREATE TABLE device (
    id SERIAL PRIMARY KEY,
    type VARCHAR(126) NOT NULL,
    name VARCHAR(126) NOT NULL UNIQUE
);
CREATE TABLE sensorpush (
    time TIMESTAMPTZ NOT NULL,
    device_id INTEGER NOT NULL,
    celsius DOUBLE PRECISION NOT NULL,
    relative_humidity DOUBLE PRECISION NOT NULL
);
SELECT create_hypertable('sensorpush', 'time');
CREATE INDEX ON sensorpush (device_id, time DESC);

-- Values from obs_st on https://weatherflow.github.io/SmartWeather/api/swagger/#!/observations/getObservationsByDeviceId
-- Allow NULL for readings as I've seen that come back from the API. Would love to tighten it up to only ones that can return null 
CREATE TABLE tempest (
    time TIMESTAMPTZ NOT NULL,
    device_id INTEGER NOT NULL,
    wind_lull DOUBLE PRECISION,
    wind_avg DOUBLE PRECISION,
    wind_gust DOUBLE PRECISION,
    wind_direction INTEGER,
    wind_sample_interval INTEGER ,
    pressure DOUBLE PRECISION,
    celsius DOUBLE PRECISION,
    relative_humidity DOUBLE PRECISION,
    illuminance DOUBLE PRECISION,
    uv DOUBLE PRECISION,
    solar_radiation DOUBLE PRECISION,
    rain_accumulation DOUBLE PRECISION,
    precipitation_type INTEGER,
    average_strike_distance DOUBLE PRECISION,
    strike_count INTEGER,
    battery DOUBLE PRECISION,
    report_interval INTEGER,
    local_day_rain_accumulation DOUBLE PRECISION,
    rain_accumulation_final DOUBLE PRECISION,
    local_day_rain_accumulation_final DOUBLE PRECISION,
    precipitation_analysis_type DOUBLE PRECISION
);
SELECT create_hypertable('tempest', 'time');
CREATE INDEX ON tempest (device_id, time DESC);

CREATE VIEW celsius (time, device_id, celsius)  
     AS (SELECT time, device_id, celsius FROM sensorpush UNION ALL SELECT time, device_id, celsius FROM tempest);