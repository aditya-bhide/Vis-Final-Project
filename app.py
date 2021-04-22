from flask import Flask, render_template, request, redirect, jsonify, url_for
import json
from preprocess import get_state_data

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
        data = get_state_data()
        # data_json = json.dumps(raw_data, indent=2)
        return data
    else:
        print("ERROR")

if __name__ == "__main__":
    app.run(debug=True)