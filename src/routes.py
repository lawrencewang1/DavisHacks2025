from src import app
from flask import render_template, request, Response
from .chat import generate_response
from .views import toggle

@app.route("/")
def home():
    return render_template("home.html")

@app.route('/map')
def map():
    return render_template('map.html')

@app.route('/chat', methods=['POST'])
def generate():
    query = request.get_data(as_text=True)
    response = generate_response(query)
    return Response(response, mimetype='text/plain')

@app.route('/map-data', methods=['POST'])
def get_map_data():
    toggle_value = request.json.get('toggle_value')
    return toggle(toggle_value)