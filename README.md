# seeries
Graphs preconfigured sets of time series and allows explorations of those graphs

## Dashboards
The seeries frontend has multiple dashboards, which are configured on the backend. A viewer can choose which dashboard to view, but the series and layout for the dashboard aren't modifiable from the UI.

The dashboard configuration specifies a few parameters for all graphs and then a list of graphs to display on that dashboard. The parameters that are global to the dashboard are:
* **start** - an absolute or relative time
* **end** - an absolute or relative time
* **live** - a boolean indicating if the graphs should fetch new data and redraw as time marches on

Then each graph in the list has this configuration:
* **title** - the title for the graph
* **series** - the names of time series to fetch and display in the graph

The dashboard draws each graph at the width of the display in rows. The top of the dashboard has controls to select another dashboard, set the start and end, and to turn live updating off.

Each graph displays its title, a labelled y-axis that scales to contain the min and max values for its series for the current time range, and labels for each series across the x-axis. Clicking on a series label will toggle its display in the graph. When a series is toggled, the y-axis is updated to fit the current set of displayed series.

Dragging left or right on a graph updates the time window displayed on the entire dashboard.

When live updating is on, new data is fetched at the rate that a new pixel would be drawn at the current time scale and the graphs are updated with that data as it comes in.

## Later
### More graph layout
Would be nice to be able to say some graphs are wider than others and define how many graphs go in a row

### Annotations
Would be cool to persistently annotate spots in a time series and have those show up in future graphing sessions

### Live URLs
As views are edited, the URL should update to encode the settings and let the user's current view be passed to someone else
