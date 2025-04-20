import google.generativeai as genai
from dotenv import load_dotenv
import os
import pandas as pd
from src import app
from flask import request, Response

df = pd.read_csv('data/final_testing_expense.csv')
csv_text = df.to_csv(index=False)

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-lite')

@app.route('/map', methods=['POST'])
def generate_response():
    query = request.get_data(as_text=True)
    prompt = csv_text + "\n Analyze the data above to answer the following query:\n" + query
    response = model.generate_content(prompt)
    return Response(response.text, mimetype='text/plain')
