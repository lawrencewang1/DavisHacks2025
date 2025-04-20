import pandas as pd
from flask import jsonify, request
from src import app

'''NOTEs TO SELF IMPLEMENT WITH FLASK LATER'''

def read_final():
    df = pd.read_csv('data/final_testing_expense.csv')
    return df


@app.route('/api/education-data', methods=['GET'])
def toggle():
    toggle_value = request.args.get('toggle_value')

    if toggle_value == 'funding':
        return jsonify(funding_map())
    else:
        return jsonify(testing_map())


def funding_map():
    df = read_final()
    return_dict = {}
    for i in range(len(df)):
        return_dict[df['County Name'][i]] = df['Expense per ADA'][i]
    return return_dict  


def testing_map():
    df = read_final()
    return_dict = {}
    for i in range(len(df)):
        return_dict[df['County Name'][i]] = {}
        return_dict[df['County Name'][i]]['Mean Score'] = df['Mean Scale Score'][i]
        return_dict[df['County Name'][i]]['Percentage Passed'] = df['Percentage Standard Met and Above'][i]
        return_dict[df['County Name'][i]]['Value'] = df['Test Calculated Value'][i]
    return return_dict 