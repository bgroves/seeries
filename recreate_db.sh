set -o errexit

if [ ! -f bootstrap/sensorpush/csv_to_sql.py ] ; then
  echo "recreate_db.sh must be run from the root of seeries. See 'Bootstrap' in README.md for directions"
  exit 1
fi

generate_sql() {
  echo "-- Generating data SQL"
  mkdir -p db/target/initdb
  # Start at 100 as the postgres container runs these in 
  # order(https://github.com/docker-library/docs/blob/master/postgres/README.md#initialization-scripts) 
  # and the timescale container we're basing off of adds three scripts starting with 0:
  # https://github.com/timescale/timescaledb-docker/tree/master/docker-entrypoint-initdb.d 
  cp src/sql/CREATE.sql db/target/initdb/100_CREATE.sql
  COUNT=101
  for f in bootstrap/sensorpush/exports/*.csv; do
    LOCATION=`basename -s .csv $f`
    python3 bootstrap/sensorpush/csv_to_sql.py $LOCATION $f > db/target/initdb/${COUNT}_${LOCATION}.sql
    ((COUNT=COUNT+1))
  done
  python3 bootstrap/tempest/json_to_sql.py > db/target/initdb/${COUNT}_tempest.sql
}

restart_container() {
  echo "-- Nuking and restarting container"
  docker-compose rm --stop --force -v
  docker-compose up --build --detach
}

wait_for_pg() {
  echo "-- Waiting for postgres server" 
  RETRIES=5
  until docker exec seeries_db_1 psql -U seeries -c "select time from tempest limit 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo "$((RETRIES--)) remaining attempts..."
    sleep 1
  done
}

generate_sql
restart_container
wait_for_pg