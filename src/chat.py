import google.generativeai as genai
from dotenv import load_dotenv
import os
import pandas as pd

df = pd.read_csv('data/final_testing_expense.csv')
csv_text = df.to_csv(index=False)

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-lite')

def generate_response(query, history):
    prompt = csv_text + "\nChat History:" + history + "\nAnalyze the data above to answer the following query in 2 sentences MAX:\n" + query
    response = model.generate_content(prompt)
    return response.text
