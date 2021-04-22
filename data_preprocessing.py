import pandas as pd
import numpy as np

def disaster_db():
    df1 = pd.read_csv("data/us_disaster_declarations.csv")

    # drop all rows with year less than 2010
    index_names = df1[df1['fy_declared'] <1979].index
    df1.drop(index_names,inplace=True)

    # List of columns to be dropped
    dropped_columns = ['fema_declaration_string', 'declaration_title','incident_begin_date',
        'incident_end_date', 'disaster_closeout_date', 'place_code',
        'designated_area', 'declaration_request_number', 'hash', 'last_refresh',
        'id','declaration_date']

    # Drop columns listed above
    df1.drop(labels=dropped_columns, axis=1 , inplace=True)

    # Rename fy_declared => year
    df1.rename(columns={"fy_declared":"year"},inplace=True)
    # # Drop duplicate pairs in disaster_number and state columns
    # df1.drop_duplicates(subset=['disaster_number','state'],inplace=True)

    # create individual_relief and community_relief collumns and add to df1
    df1['individual_relief'] = df1["ih_program_declared"] | df1["ia_program_declared"]
    df1['community_relief'] = df1["pa_program_declared"] | df1["hm_program_declared"]

    # groupby year and state 
    final_df = df1.groupby(['year','state'],as_index=False)['disaster_number'].count()

    # Sum up individual_relief and community_relief
    individual_relief = df1.groupby(['year','state'],as_index=False)['individual_relief'].sum()
    community_relief = df1.groupby(['year','state'],as_index=False)['community_relief'].sum()

    # add the columns to the final df
    final_df['individual_relief'] = individual_relief['individual_relief']
    final_df['community_relief'] = community_relief['community_relief']

    return final_df

def crime_db():
    df = pd.read_csv("data/crime_dataset.csv")
    # drop all rows with year less than 2010
    # index_names = df[df['year'] <2010].index
    # df.drop(index_names,inplace=True)

    # drop all rows with state_abbr = NaN
    index_names = df[df['state_abbr'].isna() ].index
    df.drop(index_names,inplace=True)

    # drop columns with NaN values
    df.drop(labels=["rape_legacy","rape_revised","caveats"],axis=1, inplace=True)

    return df
print("hope this pushing to branch")