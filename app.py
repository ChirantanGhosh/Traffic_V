# -*- coding: utf-8 -*-

import pandas as pd


from flask import Flask
from flask import render_template
import json


data_path = './/input//'
n_samples = 30000







app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def get_data():
    tra = pd.read_csv(data_path + 'Traffic_Violations.csv')
    #Get n_samples records
    tra = tra[tra['longitude'] != 0].sample(n=n_samples)


    

    cols_to_keep = ['TimeOfStop', 'Longitude', 'Latitude', 'Make', 'Gender', 'Race', 'Location']
    tra_clean = tra[cols_to_keep].dropna()

    return tra_clean.to_json(orient='records')


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)