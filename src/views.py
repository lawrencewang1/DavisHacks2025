import pandas as pd
from flask import request
from src import app

def read_final():
    df = pd.read_csv('data/final_testing_expense.csv')
    return df

@app.route('/map/', methods=['POST'])
def toggle():
    toggle_value = request.json['toggle_value']

    if toggle_value == 'funding':
        return funding_map()
    else:
        return testing_map()

def funding_map():
    df = read_final()
    return_dict = {}
    for i in range(len(df)):
        return_dict[df['County Name'][i]] = df['Expense per ADA'][i]
    return return_dict

def testing_map():
    df = read_final()
    return_dict = {}
    for i in len(df):
        return_dict[df['County Name'][i]] = {}
        return_dict[df['County Name'][i]]['Mean Score'] = df['Mean Score'][i]
        return_dict[df['County Name'][i]]['Percentage Passed'] = df['Percentage Standard Met and Above'][i]
        return_dict[df['County Name'][i]]['Value'] = df['Test Calculated Value'][i]
    return return_dict