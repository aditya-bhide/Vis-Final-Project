import json
from pprint import pprint
import pandas as pd
# Opening JSON file
f = open('data/us-states.json',)
dataset = pd.read_csv('data/statesdata.csv')
# returns JSON object as 
# a dictionary
us_data = json.load(f)

def get_state_data():
    for i in range(len(us_data['features'])):
        inter_data = dataset.loc[dataset['state'] == us_data['features'][i]['properties']['name']]
        if not inter_data.empty:
            us_data['features'][i]['properties']['value'] = inter_data.to_numpy()[0][1]
    return us_data