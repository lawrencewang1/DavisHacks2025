from src import app
from flask import render_template, request, Response
from .chat import generate_response
from .views import toggle

class HistoryWindow:
    def __init__(self):
        self.history = ""

hw = HistoryWindow()

@app.route("/")
def home():
    return render_template("home.html")

@app.route('/map')
def map():
    return render_template('map.html')

@app.route('/chat', methods=['POST'])
def generate():
    query = request.get_data(as_text=True)
    response = generate_response(query, hw.history)
    hw.history = hw.history + "\nrole:user,content:" + query
    hw.history = hw.history + "\nrole:model,content:" + response
    return Response(response, mimetype='text/plain')

@app.route('/map-data', methods=['POST'])
def get_map_data():
    toggle_value = request.json.get('toggle_value')
    return toggle(toggle_value)