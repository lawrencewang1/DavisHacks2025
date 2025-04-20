from src import app
from flask import render_template

@app.route("/")
def home():
    return render_template("home.html")

@app.route('/map')
def map():
    return render_template('map.html')