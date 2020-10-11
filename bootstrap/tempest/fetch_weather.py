"""Grabs about a month of data from a Tempest device

The fetched data is in the days directory, so this only needs to run if you want to
update that

This expects to be run from the directory it lives in. For every in a fixed time 
range that isn't present in the days directory, it fetches the JSON from Weatherflow
and stores the result.
"""
import urllib3

from datetime import datetime, timedelta, timezone
from os.path import exists

utc = timezone.utc

# Run from September 6th through October 4th to get a similar amount of time as the sensorpush exports
start = current = datetime(2020, 9, 6, tzinfo=utc)
end = datetime(2020, 10, 4, tzinfo=utc)

http = urllib3.PoolManager()
while current < end:
    time_start = int(current.timestamp())
    current += timedelta(1)
    if exists(f"days/{time_start}.json"):
        continue

    print("Fetching", current.date())
    # The end time is inclusive, so bump back a second to keep from getting anything from the next day
    time_end = int(current.timestamp()) - 1

    # See https://weatherflow.github.io/SmartWeather/api/swagger/#!/observations/getObservationsByDeviceId
    # for API docs
    resp = http.request(
        "GET",
        # 89061 is the Tempest device in Charlie's station at Knox St.
        "https://swd.weatherflow.com/swd/rest/observations/device/89061",
        fields={
            # This is WeatherFlow's shared development key from
            # https://weatherflow.github.io/SmartWeather/api/#getting-started
            "api_key": "20c70eae-e62f-4d3b-b3a4-8586e90f3ac8",
            "time_start": time_start,
            "time_end": time_end,
        },
    )
    assert resp.status == 200
    open(f"days/{time_start}.json", "wb").write(resp.data)
