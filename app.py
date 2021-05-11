from flask import Flask, render_template, request, redirect, jsonify, url_for
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS, cross_origin
import json
from preprocess import get_state_data
<<<<<<< HEAD
from data_preprocessing import merge_db
from data_preprocessing import us_begin, us_update, line_chart_begin, line_chart_update
=======
from data_preprocessing import crime_db, disaster_db, fetchAllCrimesForStateAndYears, fetchDisasterTypes
from data_preprocessing import us_begin, us_update
>>>>>>> b893b420c7c2f3e469b04918b0e5bac96845c4b8


app = Flask(__name__)
cors = CORS(app)
api = Api(app)


@app.route("/")
def index():
    # raw_data = get_data()
    # data_json = json.dumps(raw_data, indent=2)
    # data = {'chart_data':data_json}
    # return render_template("index.html", data=data)
    return render_template("index.html")

<<<<<<< HEAD
@app.route("/init_All", methods=["POST", "GET"])
def init_All():
=======

@app.route("/init_US", methods=["POST", "GET"])
def init_US():
>>>>>>> b893b420c7c2f3e469b04918b0e5bac96845c4b8
    if request.method == "POST":
        us_map_data = us_begin()
        line_chart_data_crime, line_chart_data_disaster = line_chart_begin()
        data = {}
        data['US_begin'] = us_map_data
        data['line_chart_begin'] = {'line_chart_data_crime': line_chart_data_crime, 'line_chart_data_disaster': line_chart_data_disaster}
        # data_json = json.dumps(raw_data, indent=2)
        return data
    else:
        print("ERROR")


@app.route("/update_US_years", methods=["POST", "GET"])
def update_US_years():
    if request.method == "POST":
        min_year = int(request.form['min_year'])
        max_year = int(request.form['max_year'])
        # print(min_year, max_year)
        data = us_update(min_year, max_year)
        return data
    else:
        print("ERROR")

@app.route("/update_line_chart", methods=["POST", "GET"])
def update_line_chart():
    if request.method == "POST":
        states = request.get_json()
        data_crime_chart_dict, data_disaster_chart_dict = line_chart_update(states['data'])
        data = {'line_chart_data_crime':data_crime_chart_dict, 'line_chart_data_disaster': data_disaster_chart_dict}
        return data
    else:
        print("ERROR")


class getPcpData(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('state_list', type=str, action="append")
        parser.add_argument('year_list', type=str, action="append")
        args = parser.parse_args()

        state_list = args['state_list']
        year_list = args['year_list']

        pcp_df = final_data.copy()
        pcp_df = pcp_df.loc[pcp_df['state_abbr'].isin(
            state_list) & pcp_df['year'].isin(year_list)]
        pcp_df[['violent_crime', 'homicide', 'property_crime', 'burglary', 'aggravated_assault']] = pcp_df[[
            'violent_crime', 'homicide', 'property_crime', 'burglary', 'aggravated_assault']].div(pcp_df['population']/100000, axis=0)
        pcp_df.drop(labels=["population", "community_relief", "robbery",
                            "state_name", 'motor_vehicle_theft'], axis=1, inplace=True)

        pcp_df = pcp_df[['state_abbr', 'year', 'disaster_number',
                         'individual_relief', 'property_crime', 'burglary', 'aggravated_assault']]
        return jsonify({"data": pcp_df.to_dict("records"), "year_list": year_list, "state_list": state_list})


class getCrimeDonutChart(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('state', type=str, action="append")
        parser.add_argument('yearList', type=str, action="append")
        args = parser.parse_args()

        state = args['state']
<<<<<<< HEAD
        year_list = args['year_list']
        # print(state, year_list)
=======
        yearList = args['yearList']

        # create a df copy to work on
        crimeDonutDf = crimeDataframe.copy()

        # call the function that returns the required dict
        crimeDonutDict, totalCrimes = fetchAllCrimesForStateAndYears(
            crimeDonutDf, state, yearList)

        return jsonify({"data": crimeDonutDict, "yearList": yearList, "state": state, "totalCrimes": str(totalCrimes)})


class getDisasterTypes(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('state', type=str, action="append")
        parser.add_argument('yearList', type=str, action="append")
        args = parser.parse_args()

        state = args['state']
        yearList = args['yearList']

        # create a df copy to work on
        disasterDf = disasterDataframe.copy()
>>>>>>> b893b420c7c2f3e469b04918b0e5bac96845c4b8

        # call the function that returns the required dict
        disasterTypesDict, totalDisasters = fetchDisasterTypes(
            disasterDf, state, yearList)

<<<<<<< HEAD
        # print(crime_donut_df_total )
        return jsonify({"data":crime_donut_df_total.to_dict('records'), "year_list":year_list, "state":[state]})
=======
        return jsonify({"data": disasterTypesDict,  "yearList": yearList, "state": state,  "totalDisasters": str(totalDisasters)})
>>>>>>> b893b420c7c2f3e469b04918b0e5bac96845c4b8


api.add_resource(getPcpData, "/getPcpData")
api.add_resource(getCrimeDonutChart, "/getCrimeDonutChart")
api.add_resource(getDisasterTypes, "/getDisasterTypes")


if __name__ == "__main__":
    # final_data = merge_db()
    crimeDataframe = crime_db()
    disasterDataframe = disaster_db()
    # print(final_data)
    app.run(debug=True)
