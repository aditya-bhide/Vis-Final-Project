import pandas as pd
import numpy as np
from pprint import pprint
import json
import copy


def disaster_db():

    df1 = pd.read_csv("data/us_disaster_declarations.csv")

    # drop all rows with year less than 1979 and greater than year 2019
    index_names = df1[(df1['fy_declared'] < 1979) |
                      (df1['fy_declared'] > 2019)].index
    df1.drop(index_names, inplace=True)

    # List of columns to be dropped
    dropped_columns = ['fema_declaration_string', 'declaration_title', 'incident_begin_date',
                       'incident_end_date', 'disaster_closeout_date', 'place_code',
                       'designated_area', 'declaration_request_number', 'hash', 'last_refresh',
                       'id', 'declaration_date', "fips"]

    # Drop columns listed above
    df1.drop(labels=dropped_columns, axis=1, inplace=True)

    return df1


def crime_db():
    df = pd.read_csv("data/crime_dataset.csv")
    # drop all rows with year less than 2010
    # index_names = df[df['year'] <2010].index
    # df.drop(index_names,inplace=True)

    # drop all rows with state_abbr = NaN
    index_names = df[df['state_abbr'].isna()].index
    df.drop(index_names, inplace=True)

    # drop columns with NaN values
    df.drop(labels=["rape_legacy", "rape_revised",
                    "caveats"], axis=1, inplace=True)

    return df


# def merge_db():
    crime_dataframe = crime_db()
    disaster_dataframe = disaster_db()

    # Left join the 2 dfs using state and year
    new_df = pd.merge(crime_dataframe, disaster_dataframe,  how='left', left_on=[
                      'year', 'state_abbr'], right_on=['year', 'state'])

    # Drop the redundant 'state' column
    new_df = new_df.drop(columns="state")

    # Replace nan values by zeroes
    new_df['disaster_number'] = new_df['disaster_number'].fillna(0)
    new_df['individual_relief'] = new_df['individual_relief'].fillna(0)
    new_df['community_relief'] = new_df['community_relief'].fillna(0)

    # Convert the dtype of 3 attributes
    new_df['disaster_number'] = new_df['disaster_number'].astype(int)
    new_df['individual_relief'] = new_df['individual_relief'].astype(int)
    new_df['community_relief'] = new_df['community_relief'].astype(int)

    return new_df


df = crime_db()
f = open('data/us-states.json')
us_data = json.load(f)
us_data_no_geo = copy.deepcopy(us_data)

# for i in range(len(us_data_no_geo['features'])):
#     us_data_no_geo['features'][i].pop('geometry', None)
#     us_data_no_geo['features'][i].pop('type', None)


def us_begin():
    data = df
    # print(data.columns)
    attribute1 = 'violent_crime'
    data_map = data[['year', 'state_name', attribute1, 'population']]
    # pprint(data_map.to_dict('records'))
    data_map = data_map.loc[(data_map['year'] >= 2019)
                            & (data_map['year'] <= 2019)]
    data_map = pd.DataFrame(data_map.groupby('state_name').agg(
        {attribute1: sum, 'population': sum})).reset_index()

    data_map_dict = {}
    for i, j, k in zip(data_map.state_name, data_map[attribute1], data_map.population):
        data_map_dict[i] = [j, k]
    counter = []
    for i in range(len(us_data['features'])):
        state = us_data['features'][i]['properties']['name']
        if state in data_map_dict:
            counter.append(
                int(data_map_dict[state][1]/data_map_dict[state][0]))
            us_data['features'][i]['properties'][attribute1] = int(
                (data_map_dict[state][0]/data_map_dict[state][1])*100000)
    us_data['other_features'] = {}
    us_data['other_features']['min_value'] = min(counter)
    us_data['other_features']['max_value'] = max(counter)
    us_data['other_features']['feature_name'] = attribute1
    # print(max_value)
    return us_data


def us_update(min_year, max_year):
    data = df
    attribute1 = 'violent_crime'
    data_map = data[['year', 'state_name', attribute1, 'population']]
    data_map = data_map.loc[(data_map['year'] >= min_year)
                            & (data_map['year'] <= max_year)]
    data_map = pd.DataFrame(data_map.groupby('state_name').agg(
        {attribute1: sum, 'population': sum})).reset_index()
    data_map_dict = {}
    for i, j, k in zip(data_map.state_name, data_map[attribute1], data_map.population):
        data_map_dict[i] = [j, k]
    counter = []
    for i in range(len(us_data_no_geo['features'])):
        state = us_data_no_geo['features'][i]['properties']['name']
        if state in data_map_dict:
            counter.append(
                int(data_map_dict[state][1]/data_map_dict[state][0]))
            us_data_no_geo['features'][i]['properties'][attribute1] = int(
                (data_map_dict[state][0]/data_map_dict[state][1])*100000)
    us_data_no_geo['other_features'] = {}
    us_data_no_geo['other_features']['min_value'] = min(counter)
    us_data_no_geo['other_features']['max_value'] = max(counter)
    us_data_no_geo['other_features']['feature_name'] = attribute1
    return us_data_no_geo


# start crime donut preprocessing

def fetchAllCrimesForStateAndYears(crimeDonutDf, stateName, yearRange):

    # match stateName and yearRange
    crimeDonutDf = crimeDonutDf.loc[(
        crimeDonutDf['state_abbr'].isin(stateName)) & crimeDonutDf['year'].isin(yearRange)]

    print("in crime chart")
    print(stateName)
    print(yearRange)

    # print(crimeDonutDf.sum(numeric_only=True).to_dict())

    # convert crime to crime per capita/1000000
    crimeDonutDf[['violent_crime', 'homicide', 'property_crime', 'burglary', 'aggravated_assault']] = crimeDonutDf[[
        'violent_crime', 'homicide', 'property_crime', 'burglary', 'aggravated_assault']].div(crimeDonutDf['population']/100000, axis=0)

    # drop all columns except crimes
    crimeDonutDf.drop(labels=["year", "population", "state_name",
                              "state_abbr", "larceny", "robbery"], axis=1, inplace=True)

    # convert all crimes to integers
    crimeDonutDf = crimeDonutDf.astype(int)

    totalCrimes = crimeDonutDf.to_numpy().sum()
    # return the sum of crimes in dictionary form
    crimeDonutDfDict = crimeDonutDf.sum(numeric_only=True).to_dict()

    return crimeDonutDfDict, totalCrimes

# end crime donut preprocessing


# start disaster type preprocessing
def fetchDisasterTypes(disasterDf, stateName, yearRange):

    # match state and yearRange
    disasterDf = disasterDf.loc[(
        disasterDf['state'].isin(stateName)) & disasterDf['fy_declared'].isin(yearRange)]

    # Count the type of each disaster
    disasterTypesDict = disasterDf['incident_type'].value_counts(
    ).rename_axis("incident_type").reset_index(name="count")

    disasterTypesDict = disasterTypesDict.to_dict(
        "records")

    # Count the total number of disasters
    totalDisasters = disasterDf['incident_type'].count()

    return disasterTypesDict, totalDisasters


# end disaster type preprocessing
