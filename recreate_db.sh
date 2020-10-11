set -o errexit

if [ ! -f bootstrap/sensorpush/csv_to_sql.py ] ; then
  echo "recreate_db.sh must be run from the root of seeries. See 'Bootstrap' in README.md for directions"
  exit 1
fi

echo "-- Generating data SQL"
for f in bootstrap/sensorpush/exports/*.csv; do
  LOCATION=`basename -s .csv $f`
  python3 bootstrap/sensorpush/csv_to_sql.py $LOCATION $f > bootstrap/generated_sql/$LOCATION.sql
done
python3 bootstrap/tempest/json_to_sql.py > bootstrap/generated_sql/tempest.sql

echo "-- Nuking and restarting container"
docker kill timescaledb
docker rm timescaledb
docker run -d --name timescaledb -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=password timescale/timescaledb:latest-pg12

echo "-- Waiting for postgres server" 
RETRIES=5
until PGPASSWORD=password psql -h localhost -U postgres -p 5432 -c "select 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "$((RETRIES--)) remaining attempts..."
  sleep 1
done

echo "-- Creating schema"
PGPASSWORD=password psql -h localhost -p 5432 -U postgres -f src/sql/CREATE.sql 

for f in bootstrap/generated_sql/*.sql ; do
  echo "-- Loading $f"
  PGPASSWORD=password psql -h localhost -p 5432 -U postgres -f $f
done