# seeries frontend

## Libraries
To handle the stated requirements I propose the following:

* [react](https://github.com/facebook/react/) - De facto UI choice will make it straightforward to pick the rest of the libraries.
* [react-router](https://github.com/ReactTraining/react-router) - Should make the "Live URLs" feature easy to do later.
* [react-bootstrap](https://github.com/react-bootstrap/react-bootstrap) - Handles the UI chrome and makes it easy to have mobile and desktop versions. Also will make "More graph layout" feature possible later.
* [recharts](https://github.com/recharts/recharts) - Wrapper around D3 to draw the actual graphs.

## Layout
There will be a single navigation menu at the top of the screen that will collapse at the "small" media query to show a hamburger menu for mobile clients. The menu will contain a link to each dashboard in the order they're defined by the backend. To be able to devote as much space as possible to graphs the menu will not be "fixed" to the top of the screen. The body will be the title of the page followed by content, usually the graphs in a dashboard. The footer will have a "return to top" link to skip over possibly long graphs.

## Dashboard Configuration Notes
Exactly how the backend dashboard configuration gets to the frontend hasn't been specified but there are essentially two different ways: embedding them in the single page app or adding another API endpoint to retrieve them. Either would work but I would lean towards the additional API endpoint with an eye towards that eventually being part of a dashboard creation and configuration UI. 

## Pages

### Dashboard List (/dashboards)
The default home page that shows a list of all the dashboards defined on the backend.

### Dashboard Detail (/dashboards/:name)
Heart of the app that will show a graph for each set of series associated with the selected dashboard for the URL. Controls for selecting start/end time and toggling live updating will be at the top of all of the graphs. Until they're configurable colors will be assigned to each series from a predefined list to make sure there's contrast. If an error is received from the API a list of the unknown series names would be shown instead. The live update feature may require optimization depending on how many data points are shown and how redrawing works with the recharts library.

## Later

### Configuration
* **application wide themes** - Probably just selecting dark or light background/text.
* **dashboard pinning** - Keep the most used dashboards pinned as top level menu links in a defined order and put the rest in a dropdown menu.
* **dashboard themes** - Select colors per series and/or per graph.
* **selectable home page** - Instead of the list of all of the dashboards possibly a default dashboard.

### User Preferences
Once there's some configuration available it would probably make sense to have some of it configurable per user once authentication is available to have users.
