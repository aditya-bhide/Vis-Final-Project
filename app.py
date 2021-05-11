from flask import Flask, render_template, request, redirect, jsonify, url_for
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS, cross_origin
import json
from preprocess import get_state_data
from data_preprocessing import crime_db, disaster_db, fetchAllCrimesForStateAndYears, fetchDisasterTypes
from data_preprocessing import us_begin, us_update


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


@app.route("/init_US", methods=["POST", "GET"])
def init_US():
    if request.method == "POST":
        print("SHit is happening")
        data = us_begin()
        # data_json = json.dumps(raw_data, indent=2)
        return data
    else:
        print("ERROR")


@app.route("/update_US_years", methods=["POST", "GET"])
def update_US_years():
    if request.method == "POST":
        print("called update")
        min_year = int(request.form['min_year'])
        max_year = int(request.form['max_year'])
        data = us_update(min_year, max_year)
        # data_json = json.dumps(raw_data, indent=2)
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

        # call the function that returns the required dict
        disasterTypesDict, totalDisasters = fetchDisasterTypes(
            disasterDf, state, yearList)

        return jsonify({"data": disasterTypesDict,  "yearList": yearList, "state": state,  "totalDisasters": str(totalDisasters)})


api.add_resource(getPcpData, "/getPcpData")
api.add_resource(getCrimeDonutChart, "/getCrimeDonutChart")
api.add_resource(getDisasterTypes, "/getDisasterTypes")


if __name__ == "__main__":
    # final_data = merge_db()
    crimeDataframe = crime_db()
    disasterDataframe = disaster_db()
    # print(final_data)
    app.run(debug=True)
