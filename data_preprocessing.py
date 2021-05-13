import pandas as pd
import numpy as np
from pprint import pprint
import json
import copy

states_name_to_abbr = {}
states_abbr_to_name = {}
disaster_types = []


def disaster_db():
    global disaster_types
    df1 = pd.read_csv("data/us_disaster_declarations.csv")

    # drop all rows with year less than 1979 and greater than year 2019
    index_names = df1[(df1['fy_declared'] < 1979) |
                      (df1['fy_declared'] > 2019)].index
    df1.drop(index_names, inplace=True)

    disaster_types = df1['incident_type'].unique()
    # List of columns to be dropped
    dropped_columns = ['fema_declaration_string', 'declaration_title', 'incident_begin_date',
                       'incident_end_date', 'disaster_closeout_date', 'place_code',
                       'designated_area', 'declaration_request_number', 'hash', 'last_refresh',
                       'id', 'declaration_date', "fips"]

    # Drop columns listed above
    df1.drop(labels=dropped_columns, axis=1, inplace=True)

    return df1


def crime_db():
    df = pd.read_csv("data/crime_dataset.csv", index_col=False)
    for i, rows in df.iterrows():
        if rows['state_name'] not in states_name_to_abbr:
            states_name_to_abbr[rows['state_name']] = rows['state_abbr']

    for i, rows in df.iterrows():
        if rows['state_abbr'] not in states_abbr_to_name:
            states_abbr_to_name[rows['state_abbr']] = rows['state_name']
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


def merge_db():
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

df_disaster = disaster_db()

for i in range(len(us_data_no_geo['features'])):
    us_data_no_geo['features'][i].pop('geometry', None)
    us_data_no_geo['features'][i].pop('type', None)

defaul_years_start = 1979
defaul_years_end = 2019
# attribute1 = 'all_crimes'


def us_begin():
    data = df
    data_map = data[['year', 'state_name', 'all_crimes', 'population']]
    data_map = data_map.loc[(data_map['year'] >= defaul_years_start) & (
        data_map['year'] <= defaul_years_end)]
    data_map = data_map[['state_name', 'all_crimes', 'population']]
    data_map['aggr_crimes'] = (
        data_map['all_crimes']/data_map['population']) * 100000

    data_map = data_map.groupby('state_name', as_index=False).mean()
    data_map_dict = {}
    for i, j in zip(data_map['state_name'], data_map['aggr_crimes']):
        data_map_dict[i] = j

    for i in range(len(us_data['features'])):
        state = us_data['features'][i]['properties']['name']
        if state in data_map_dict:
            us_data['features'][i]['properties']['aggr_crimes'] = int(
                data_map_dict[state])

    us_data['other_features'] = {}
    us_data['other_features']['min_value'] = int(data_map['aggr_crimes'].min())
    us_data['other_features']['max_value'] = int(data_map['aggr_crimes'].max())
    us_data['other_features']['feature_name'] = 'aggr_crimes'
    return us_data


def us_update(min_year=1979, max_year=2019, attribute='all_crimes'):
    data = df
    data_map = data[['year', 'state_name', attribute, 'population']]
    data_map = data_map.loc[(data_map['year'] >= min_year)
                            & (data_map['year'] <= max_year)]
    data_map = data_map[['state_name', attribute, 'population']]

    data_map['aggr_crimes'] = (
        data_map[attribute]/data_map['population']) * 100000
    data_map = data_map.groupby('state_name', as_index=False).mean()

    data_map_dict = {}
    for i, j in zip(data_map['state_name'], data_map['aggr_crimes']):
        data_map_dict[i] = j

    for i in range(len(us_data_no_geo['features'])):
        state = us_data_no_geo['features'][i]['properties']['name']
        if state in data_map_dict:
            us_data_no_geo['features'][i]['properties']['aggr_crimes'] = int(
                data_map_dict[state])

    us_data_no_geo['other_features'] = {}
    us_data_no_geo['other_features']['min_value'] = int(
        data_map['aggr_crimes'].min())
    us_data_no_geo['other_features']['max_value'] = int(
        data_map['aggr_crimes'].max())
    us_data_no_geo['other_features']['feature_name'] = 'aggr_crimes'
    return us_data_no_geo


def line_chart_begin():
    data_crime = df
    data_disaster = df_disaster
    data_crime_chart = data_crime[['year', 'all_crimes', 'population']]
    # data_crime_chart['crimes'] = (
    #     data_crime_chart['all_crimes']/data_crime_chart['population']) * 100000
    # data_crime_chart = data_crime_chart.astype({'crimes': int})
    data_crime_chart = data_crime_chart.groupby('year', as_index=False).sum()
    data_crime_chart['crimes'] = data_crime_chart['all_crimes']/10000
    data_crime_chart_dict = data_crime_chart.to_dict('records')

    # for i in range(len(data_crime_chart_dict)):
    #     data_crime_chart_dict[i]['crimes'] = int(
    #         data_crime_chart_dict[i]['crimes'])

    data_disaster_chart = data_disaster[['fy_declared', 'incident_type']]
    # data_disaster_chart = data_disaster_chart.loc[data_disaster_chart['incident_type'] == selected_disaster]

    data_disaster_chart = data_disaster_chart['fy_declared'].value_counts()
    data_disaster_chart = pd.DataFrame(
        {'year': data_disaster_chart.index, 'disasters': data_disaster_chart.values})
    data_disaster_chart_dict = data_disaster_chart.sort_values(
        by=['year']).to_dict('records')
    return data_crime_chart_dict, data_disaster_chart_dict


def line_chart_update(selected_states="all", attribute_crime="all_crimes", selected_disaster="all_disasters",):
    data_crime = df
    data_disaster = df_disaster

    if len(selected_states) != 0:
        for i in range(len(selected_states)):
            selected_states[i] = states_name_to_abbr[selected_states[i]]
        data_crime = data_crime.loc[data_crime['state_abbr'].isin(
            selected_states)]
        data_disaster = data_disaster.loc[data_disaster['state'].isin(
            selected_states)]

    data_crime_chart = data_crime[['year', attribute_crime, 'population']]
    # data_crime_chart['crimes'] = (
    #     data_crime_chart[attribute_crime]/data_crime_chart['population']) * 100000
    # data_crime_chart = data_crime_chart.astype({'crimes': int})
    # data_crime_chart = data_crime_chart.groupby('year', as_index=False).mean()
    data_crime_chart = data_crime_chart.groupby('year', as_index=False).sum()
    data_crime_chart['crimes'] = data_crime_chart[attribute_crime]/10000
    data_crime_chart_dict = data_crime_chart.to_dict('records')

    # for i in range(len(data_crime_chart_dict)):
    #     data_crime_chart_dict[i]['crimes'] = int(
    #         data_crime_chart_dict[i]['crimes'])

    data_disaster_chart = data_disaster[['fy_declared', 'incident_type']]
    if selected_disaster == "all_disasters":
        pass
    else:
        data_disaster_chart = data_disaster_chart.loc[data_disaster_chart['incident_type']
                                                      == selected_disaster]

    data_disaster_chart = data_disaster_chart['fy_declared'].value_counts()
    data_disaster_chart = pd.DataFrame(
        {'year': data_disaster_chart.index, 'disasters': data_disaster_chart.values})
    data_disaster_chart_dict = data_disaster_chart.sort_values(
        by=['year']).to_dict('records')
    # pprint(data_disaster_chart_dict)
    return data_crime_chart_dict, data_disaster_chart_dict


# start crime donut preprocessing

def fetchAllCrimesForStateAndYears(crimeDonutDf, stateName, yearRange):

    if not stateName:
        crimeDonutDf = crimeDonutDf.loc[(crimeDonutDf['year'] >= int(
            yearRange[0])) & (crimeDonutDf['year'] <= int(yearRange[1]))]
    else:
        # match stateName and yearRanges
        crimeDonutDf = crimeDonutDf.loc[(
            crimeDonutDf['state_name'].isin(stateName)) & (crimeDonutDf['year'] >= int(yearRange[0])) & (crimeDonutDf['year'] <= int(yearRange[1]))]

    # print(crimeDonutDf.sum(numeric_only=True).to_dict())

    # convert crime to crime per capita/1000000
    crimeDonutDf[['violent_crime', 'homicide', 'property_crime', 'burglary', 'aggravated_assault']] = crimeDonutDf[[
        'violent_crime', 'homicide', 'property_crime', 'burglary', 'aggravated_assault']].div(crimeDonutDf['population']/1000000000, axis=0)

    # drop all columns except crimes
    crimeDonutDf.drop(labels=["year", "population", "state_name",
                              "state_abbr", "larceny", "robbery", "all_crimes"], axis=1, inplace=True)

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
    if not stateName:
        disasterDf = disasterDf.loc[(disasterDf['fy_declared'] >= int(
            yearRange[0])) & (disasterDf['fy_declared'] <= int(yearRange[1]))]

    else:
        state_abbr_list = []
        for i in stateName:
            state_abbr_list.append(states_name_to_abbr[i])
        disasterDf = disasterDf.loc[(
            disasterDf['state'].isin(state_abbr_list)) & (disasterDf['fy_declared'] >= int(yearRange[0])) & (disasterDf['fy_declared'] <= int(yearRange[1]))]

    # Count the type of each disaster
    disasterTypesDict = disasterDf['incident_type'].value_counts()
    disasterTypesDict = disasterTypesDict.rename_axis(
        "incident_type").reset_index(name="count")

    print(stateName)

    for disaster in disaster_types:
        if(disaster not in list(disasterTypesDict['incident_type'])):
            disasterTypesDict = disasterTypesDict.append(
                {"incident_type": disaster, "count": 0}, ignore_index=True)

    disasterTypesDict = disasterTypesDict.to_dict(
        "records")

    print(len(disasterTypesDict))

    # Count the total number of disasters
    totalDisasters = disasterDf['incident_type'].count()

    return disasterTypesDict, totalDisasters

# end disaster type preprocessing


def fetchStatesWithMaxDisasters(disasterDf, disasterTypeList, yearRange):

    # Check if all disasters or a particular disaster
    if not disasterTypeList:

        disasterDf = disasterDf.loc[(disasterDf['fy_declared'] >= int(
            yearRange[0])) & (disasterDf['fy_declared'] <= int(yearRange[1]))]

    else:
        disasterDf = disasterDf.loc[(disasterDf['fy_declared'] >= int(
            yearRange[0])) & (disasterDf['fy_declared'] <= int(yearRange[1])) & (disasterDf['incident_type'] == disasterTypeList[0])]

    disastersPerStateSeries = disasterDf['state'].value_counts(
    ).rename_axis("state_name").reset_index(name="count").head(5)
    disastersPerStateDict = disastersPerStateSeries.to_dict("records")

    for i in disastersPerStateDict:
        i['state_name'] = states_abbr_to_name[i['state_name']]

    totalDisastersOccured = disasterDf['state'].value_counts().sum()

    return disastersPerStateDict, totalDisastersOccured
