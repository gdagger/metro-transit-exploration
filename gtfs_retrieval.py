# from google.transit import gtfs_realtime_pb2
import urllib
import pandas as pd
import json
import gtfs_kit as gk
from geojson import dump
from pandas_geojson import to_geojson


#Declare the directory path for the GTFS zip file
path = 'https://svc.metrotransit.org/mtgtfs/gtfs.zip'


# Read the feed with gtfs-kit and get shapes
feed = (gk.read_feed(path, dist_units='mi'))
feed_geojson = feed.shapes_to_geojson()

# Get trips data
trips_df = pd.DataFrame(feed.trips)
# Filter to only unique values of route_id and shape_id pairings
routes_shapes = trips_df[['shape_id', 'route_id']].drop_duplicates()
# Create dictionary to get route_id from shape_id
route_shape_dict = dict(zip(routes_shapes.shape_id, routes_shapes.route_id))


# Retrieve Routes data
routes_df = pd.DataFrame(feed.get_routes())
# Combine short/long names for routes into a new route_name column and drop 
routes_df[routes_df['route_short_name'].isna() | routes_df['route_long_name'].isna()]
routes_df['route_name'] = routes_df['route_short_name'].combine_first(routes_df['route_long_name'])
routes_df = routes_df.drop(columns=['route_short_name', 'route_long_name'])

# Filter dataframe to desired properties and create dictionary
routes_info = routes_df[['route_id', 'route_desc', 'route_type', 'route_color', 'route_name']]
routes_info['route_color'] = routes_info['route_color'].fillna('ffffff')
routes_info_dict = routes_info.set_index('route_id').agg(list, axis=1).to_dict()


# Loop through geojson features to add properties
for feature in feed_geojson['features']:

    properties = feature['properties']
    shape_id = properties['shape_id']
    route_id = route_shape_dict[shape_id]

    properties['route_id'] = route_id
    properties['route_desc'] = routes_info_dict[route_id][0]
    properties['route_type'] = routes_info_dict[route_id][1]
    properties['route_name'] = routes_info_dict[route_id][3]
    properties['route_color'] = routes_info_dict[route_id][2]


# Create function to set geojson data as a variable in local js file
def write_geojson(file, data, varname):
    file_path = f"./static/data/{file}"
    
    # Write geojson data to shapes.js
    with open(file_path, 'w', encoding='utf-8') as f:
        dump(data, f, ensure_ascii=False, indent=4)

    # Add line to store geojson as variable to be called
    with open(file_path) as f:
        lines = f.readlines()
        text = f'let {varname} = '
        lines.insert(0, text)
    
    with open(file_path, 'w') as f:
        f.write(''.join(lines))

# Call function
write_geojson('shapes.js', feed_geojson, 'feed_geojson')

# Retrieve Stops data and store as dataframe
stops_df = pd.DataFrame(feed.get_stops())

# Fill empty platform code values
stops_df['platform_code'] = stops_df['platform_code'].fillna('None')

stops_geojson = to_geojson(df=stops_df, lat='stop_lat', lon='stop_lon',
                 properties=['stop_id', 'stop_name', 'stop_desc', 'location_type', 'wheelchair_boarding', 'platform_code'])

write_geojson('stops.js', stops_geojson, 'stops_geojson')