from flask import Flask, render_template, request, redirect, jsonify, url_for
from flask_restful import Resource,Api,reqparse
import json
from preprocess import get_state_data
<<<<<<< HEAD
from data_preprocessing import merge_db
=======
from data_preprocessing import us_begin, us_update
>>>>>>> 660d1658a0d85be79859b3560f59b806f1210dc4

app = Flask(__name__)
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
        parser.add_argument('state_list', type=str ,action="append")
        parser.add_argument('year_list', type=str ,action="append")
        args = parser.parse_args()  

        state_list = args['state_list']
        year_list = args['year_list']
        
        pcp_df = final_data.copy()
        pcp_df = pcp_df.loc[pcp_df['state_abbr'].isin(state_list) & pcp_df['year'].isin(year_list)]
        pcp_df[['violent_crime','homicide','property_crime','burglary','aggravated_assault']] = pcp_df[['violent_crime','homicide','property_crime','burglary','aggravated_assault']].div(pcp_df['population']/100000, axis=0)
        pcp_df.drop(labels=["population","community_relief","robbery","state_name",'motor_vehicle_theft'],axis=1, inplace=True)

        pcp_df = pcp_df[['state_abbr','year','disaster_number','individual_relief','homicide','burglary','aggravated_assault']]
        return jsonify({"data":pcp_df.to_dict("records"), "year_list":year_list, "state_list":state_list})

api.add_resource(getPcpData, "/getPcpData")

if __name__ == "__main__":
    final_data = merge_db()
    app.run(debug=False)