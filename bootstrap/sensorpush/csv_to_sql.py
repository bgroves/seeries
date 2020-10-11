"""Converts a sensorpush CSV export into a big chunk of INSERTs that are printed to stdout

Takes in the name of the sensor and the csv file as arguments. Prints out a Postgres 
anonymous code block that inserts a device with that name in the devices table and then
inserts the csv as readings for that device in the sensorpush table.
"""
import csv
import sys

print(
    f"""DO $$
DECLARE
    device_id integer;
BEGIN
INSERT INTO device (type, name)
    VALUES ('sensorpush', '{sys.argv[1]}')
    RETURNING id INTO device_id;
INSERT INTO sensorpush VALUES"""
)
csvfile = open(sys.argv[2], newline="")
reader = csv.reader(csvfile)
next(reader, None)  # Skip the header
print(
    *(
        f"    ('{row[0]} -4:00', device_id, {(float(row[1]) - 32) * 5.0 / 9.0 }, {row[2]})"
        for row in reader
    ),
    sep=",\n",
    end=""";
END$$;""",
)
