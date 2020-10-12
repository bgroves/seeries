set -o errexit
export PGPASSWORD=RcJhCBt2CE2dz7#B

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
 # --force because we don't want to be prompted, -v to remove the anonymous volumes we attach to postgres
docker-compose rm --stop --force -v
docker-compose up --detach

echo "-- Waiting for postgres server" 
RETRIES=5
until psql -h localhost -U seeries -p 5432 -c "select 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "$((RETRIES--)) remaining attempts..."
  sleep 1
done

echo "-- Creating schema"
psql -h localhost -p 5432 -U seeries -f src/sql/CREATE.sql 

for f in bootstrap/generated_sql/*.sql ; do
  echo "-- Loading $f"
  psql -h localhost -p 5432 -U seeries -f $f
done