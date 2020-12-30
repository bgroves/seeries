# seeries
Graphs preconfigured sets of time series and allows explorations of those graphs

## Dashboards
The seeries frontend has multiple dashboards, which are configured on the backend. A viewer can choose which dashboard to view, but the series and layout for the dashboard aren't modifiable from the UI.

The dashboard configuration specifies a few parameters for all graphs and then a list of graphs to display on that dashboard. The configuration that's global to the dashboard is:
* **start** - an absolute or relative time for initial graph display
* **end** - an absolute or relative time for initial graph display
* **live** - a boolean indicating if the graphs should fetch new data and redraw as time marches on

Then each graph in the list has this configuration:
* **title** - the title for the graph
* **series** - the time series to fetch and display in the graph. An array of series objects containing the following fields:
  * **device_name** - the name of the device to return readings for e.g. `inside`
  * **sensor** - the sensor from the device to return readings for e.g. `celsius`
  * **aggregation** - how to combine readings if there are more readings than points for the time period e.g. `MIN` or `MAX` or `AVG`

The dashboard draws each graph at the width of the display in rows. The top of the dashboard has controls to select another dashboard, set the start and end, and to turn live updating off.

Each graph displays its title, a labelled y-axis that scales to contain the min and max values for its series for the current time range, and labels for each series across the x-axis. Clicking on a series label will toggle its display in the graph. When a series is toggled, the y-axis is updated to fit the current set of displayed series.

Dragging left or right on a graph updates the time window displayed on the entire dashboard.

When live updating is on, new data is fetched at the rate that a new pixel would be drawn at the current time scale and the graphs are updated with that data as it comes in.

## API
seeries' API has one endpoint, series. It takes four parameters:
* **start** - an absolute time
* **end** - an absolute time
* **points** - integer number of points to return for that start and end
* **device_name** - the name of the device to return readings for e.g. `inside`
* **sensor** - the sensor from the device to return readings for e.g. `celsius`
* **aggregation** - how to combine readings if there are more readings than points for the time period e.g. `MIN` or `MAX` or `AVG`

It returns a top-level JSON array of **segment** objects each containing these fields. 
* **start** - an absolute time
* **end** - an absolute time
* **values** - an array of numbers of values over that time period

If the underlying series has coverage for the entire requested time, there will only be a single object in the array. If there are gaps, there will be a segment for each set of contiguous points.

If any the device_name or sensor don't exist, a 400 is returned with a message naming the unknown value.

## Later
Things that we will almost certainly want at some point. We're explicitly not doing them now to keep things simpler to ship something.

### More graph layout
Would be nice to be able to say some graphs are wider than others and define how many graphs go in a row. Was thinking maybe we could say there are 6 columns per row and that a graph can be from 1 to 6 columns. 6 is nice since it lets you divide a row into half or thirds. I can't see us needing more granularity than that though.

### Annotations
Would be cool to persistently annotate spots in a time series and have those show up in future graphing sessions

### Live URLs
As views are edited, the URL should update to encode the settings and let the user's current view be passed to someone else

### Dashboard creation and configuration UI
Duh.

### Authentication
Will need this eventually.

## Bootstrap
This repo contains some sample data and a script to create a Timescale DB in Docker and load it. To do so:
1. `cd <root of your seeries checkout>`
2. `cp .env.example .env` and change `POSTGRES_PASSWORD` in `.env`
3. sh recreate_db.sh

This assumes that you have Docker and a reasonably recent vintage of Python 3 installed. I've been running it with Python 3.8.6

## Running the Frontend
This should make sure that yarn fixes the dependencies from create-react-app:
1. cd <root of your seeries checkout>
2. yarn install or yarn start-frontend

After they've been installed it will also run directly from packages/seeries-frontend with yarn start.
