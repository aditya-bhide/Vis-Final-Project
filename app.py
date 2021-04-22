from flask import Flask, render_template, request, redirect, jsonify, url_for
import json
from preprocess import get_state_data
from data_preprocessing import us_begin, us_update

app = Flask(__name__)

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

if __name__ == "__main__":
    app.run(debug=True)