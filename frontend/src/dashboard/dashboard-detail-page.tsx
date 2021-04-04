import React, { useEffect, useState } from 'react';
import Dashboard from './dashboard';
import DashboardDetail from './dashboard-detail';
import labels from '../labels';
import { useQuery } from '../ui/react-router-utils';
import { useParams } from 'react-router-dom';
import { getDashboard } from './dashboard-api';
import GraphViewModel from '../graph/graph-view-model';
import { fetchAllSeries } from '../series/series-api';
import { useAsyncError } from '../ui/error-boundary-utils';

export interface DashboardDetailPageProps {
  setTitle: (title: string) => void;
}

function DashboardDetailPage({
  setTitle,
}: DashboardDetailPageProps): React.ReactElement {
  const query = useQuery();
  const start = query.get('start');
  const end = query.get('end');
  const live = query.get('live');

  const { name } = useParams<{ name: string }>();

  let throwError = useAsyncError();
  let [dashboard, setDashboard] = useState<Dashboard>();
  let [graphs, setGraphs] = useState<GraphViewModel[]>();

  useEffect(() => {
    getDashboard(name, { start: start, end: end, live: live })
      .then((loadedDashboard) => {
        setDashboard(loadedDashboard);
        console.log({ name: name, loadedDashboard: loadedDashboard });

        setTitle(
          labels('dashboardDetailPageTitle', {
            title: loadedDashboard.title,
          })
        );

        const series = fetchAllSeries(
          loadedDashboard,
          loadedDashboard.requiredSeries
        );

        Promise.all(
          loadedDashboard.graphs.map((it) => {
            return GraphViewModel.create(loadedDashboard, it, series);
          })
        )
          .then(setGraphs)
          .catch(throwError);
      })
      .catch((e) => {
        throwError(e);
      });
  }, [name, start, end, live, setTitle, throwError]);

  return (
    <>
      {dashboard === undefined || graphs === undefined ? (
        ''
      ) : (
        <DashboardDetail dashboard={dashboard} graphs={graphs} />
      )}
    </>
  );
}

export default DashboardDetailPage;
