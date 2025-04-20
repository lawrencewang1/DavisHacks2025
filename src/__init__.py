from flask import Flask
from flask_cors import CORS

app = Flask(__name__, template_folder='../templates', static_folder='../static')
CORS(app)

from src import routes