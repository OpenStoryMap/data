"""
This python file takes a bunch of location files and a Data file from the
NYC Environmental and Health Data Portal, and turns the data into a geojson file.

To get the location data, go to https://a816-dohbesp.nyc.gov/IndicatorPublic/BuildATable.aspx
and download the geojson map files on the left. Unzip those files into a directory.
The directory with the unzipped files is the --location-directory from the arguments.

Using that same link, https://a816-dohbesp.nyc.gov/IndicatorPublic/BuildATable.aspx, you can
create custom datasets. These will download as zipped files. Move the zipped files into their
own directories, which will become the --data argument.

Running this script will create a geojson file in the --data directory called [--output].json
"""

import argparse
import geopandas
import os
import pandas as pd


def parse_args():
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('--location-directory', type=str, default="data/location")
    parser.add_argument('--data', type=str)
    parser.add_argument('--output', type=str)

    return parser.parse_args()


def get_locations(directory: str):
    filenames = [f for f in os.listdir(directory) if f.endswith('.json')]
    dfs = []
    for filename in filenames:
        try:
            df = geopandas.read_file(os.path.join(directory, filename))
            df['TYPE'] = filename.replace('.json', '')
        except:
            pass
        dfs.append(df)

    return pd.concat(dfs, ignore_index=True)


def get_data(directory: str):
    filename = os.path.join(directory, 'Data.csv')
    return pd.read_csv(filename)


def main():
    args = parse_args()

    columns = ['year_description', 'data_value', 'geo_type_name', 'geo_entity_id', 'metric']

    location_df = get_locations(args.location_directory)
    data_df = get_data(args.data)
    data_df['metric'] = data_df['name'] + ' - ' + data_df['Measure']
    data_df_pivot = data_df.pivot_table('data_value', ['geo_entity_id', 'geo_type_name'], 'metric').reset_index()

    columns_final = [*data_df_pivot.columns, 'geometry']
    df = data_df_pivot.merge(
        location_df[['GEOCODE', 'GEONAME', 'geometry', 'TYPE']],
        left_on=['geo_entity_id', 'geo_type_name'],
        right_on=['GEOCODE', 'TYPE'])[columns_final]

    df = df.drop(['geo_entity_id'], axis=1)

    geopandas.GeoDataFrame(df).to_file(os.path.join(args.data, args.output))
    pass


if __name__ == '__main__':
    main()
