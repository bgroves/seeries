import Polyglot from 'node-polyglot';

const phrases = {
  allDashboards: 'Dashboards',
  allDashboardsPageTitle: 'All Dashboards',
  dashboardDetailPageTitle: 'Dashboard %{title}',
  applicationName: 'seeries',
  startTime: 'Start Time',
  endTime: 'End Time',
  lightTheme: 'Light',
  darkTheme: 'Dark',
  scrollToTop: 'Scroll To Top',
  home: 'Home',
};

const Labels = new Polyglot({
  allowMissing: true,
  locale: 'en',
  phrases: phrases,
});

export { Labels };

export default Labels.t.bind(Labels);
