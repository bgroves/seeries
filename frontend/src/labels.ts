import Polyglot from 'node-polyglot';

const phrases = {
  allDashboards: 'Dashboards',
  allDashboardsPageTitle: 'All Dashboards',
  applicationName: 'seeries',
  darkTheme: 'Dark',
  dashboardDetailPageTitle: 'Dashboard %{title}',
  end: 'End Time',
  endTime: 'End Time',
  home: 'Home',
  lightTheme: 'Light',
  live: 'Live Update',
  scrollToTop: 'Scroll To Top',
  start: 'Start Time',
  startTime: 'Start Time',
  submit: 'Submit',
};

const Labels = new Polyglot({
  allowMissing: true,
  locale: 'en',
  phrases: phrases,
});

export { Labels };

export default Labels.t.bind(Labels);
