import pandas as pd
import numpy as np
from pprint import pprint
import json
import copy


def us_begin():
    data = df
    # print(data.columns)
    attribute1 = 'violent_crime'
    data_map = data[['year','state_name', attribute1, 'population']]
    # pprint(data_map.to_dict('records'))
    data_map = data_map.loc[(data_map['year'] >= defaul_years_start) & (data_map['year'] <= defaul_years_end)]
    data_map = pd.DataFrame(data_map.groupby('state_name').agg({attribute1: sum, 'population': sum})).reset_index()

    data_map_dict = {}
    for i,j,k in zip(data_map.state_name, data_map[attribute1], data_map.population):
        data_map_dict[i] = [j, k]
    counter = []
    for i in range(len(us_data['features'])):
        state = us_data['features'][i]['properties']['name']
        if state in data_map_dict:
            counter.append(int(data_map_dict[state][1]/data_map_dict[state][0]))
            us_data['features'][i]['properties'][attribute1] = int((data_map_dict[state][0]/data_map_dict[state][1])*100000)
    us_data['other_features'] = {}
    us_data['other_features']['min_value'] = min(counter)
    us_data['other_features']['max_value'] = max(counter)
    us_data['other_features']['feature_name'] = attribute1
    # print(max_value)
    return us_data

def us_update(min_year, max_year):
    data = merged
    attribute1 = 'violent_crime'
    data_map = data[['year','state_name', attribute1, 'population']]
    data_map = data_map.loc[(data_map['year'] >= min_year) & (data_map['year'] <= max_year)]
    data_map = pd.DataFrame(data_map.groupby('state_name').agg({attribute1: sum, 'population': sum})).reset_index()
    data_map_dict = {}
    for i,j,k in zip(data_map.state_name, data_map[attribute1], data_map.population):
        data_map_dict[i] = [j, k]
    counter = []
    for i in range(len(us_data_no_geo['features'])):
        state = us_data_no_geo['features'][i]['properties']['name']
        if state in data_map_dict:
            counter.append(int(data_map_dict[state][1]/data_map_dict[state][0]))
            us_data_no_geo['features'][i]['properties'][attribute1] = int((data_map_dict[state][0]/data_map_dict[state][1])*100000)
    us_data_no_geo['other_features'] = {}
    us_data_no_geo['other_features']['min_value'] = min(counter)
    us_data_no_geo['other_features']['max_value'] = max(counter)
    us_data_no_geo['other_features']['feature_name'] = attribute1
    return us_data_no_geo

def line_chart_begin():
    data = merged
    attribute1 = 'violent_crime'
    data_crime_chart = data[['year','state_name', attribute1, 'population']]
    data_crime_chart = data_crime_chart.loc[(data_crime_chart['year'] >= defaul_years_start) & (data_crime_chart['year'] <= defaul_years_end)]
    data_crime_chart = pd.DataFrame(data_crime_chart.groupby('year').agg({attribute1: sum, 'population': sum})).reset_index()
    data_crime_chart_dict = data_crime_chart.to_dict('records')
    for i in range(len(data_crime_chart_dict)):
        data_crime_chart_dict[i]['temp1'] = int((data_crime_chart_dict[i][attribute1] / data_crime_chart_dict[i]['population']) * 100000)
    
    return data_crime_chart_dict