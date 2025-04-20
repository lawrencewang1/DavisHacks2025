from flash import Flash, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('map.html') 