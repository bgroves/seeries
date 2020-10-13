"""Converts a WeatherFlow JSON into a big chunk of INSERTs that are printed to stdout

This uses the JSON fetched by fetch_weather.py in this directory. It expects to be run 
from the repo root. It prints a Postgres anonymous code block that inserts a tempest 
device named knox, and then inserts a row for every reading for the JSON in the days
directory.
"""
from os import listdir
from json import load
from time import gmtime, strftime

print(
    """DO $$
DECLARE
    device_id integer;
BEGIN
INSERT INTO device (type, name)
    VALUES ('tempest', 'knox')
    RETURNING id INTO device_id;
INSERT INTO tempest VALUES"""
)


def timestamp(epoch_seconds):
    return strftime("%Y-%m-%d %H:%M:00 +0:00", gmtime(epoch_seconds))


def all_obs():
    for fn in sorted(listdir("bootstrap/tempest/days")):
        for ob in load(open(f"bootstrap/tempest/days/{fn}"))["obs"]:
            yield ob


def handle_null_ob(reading):
    """Very rarely a particular sensor returns null for a reading, so turn that into a NULL for the row"""
    return str(reading) if reading is not None else "NULL"


print(
    *(
        f"    ('{timestamp(ob[0])}', device_id, {', '.join((handle_null_ob(o) for o in ob[1:]))})"
        for ob in all_obs()
    ),
    sep=",\n",
    end=""";
END$$;""",
)
