import pandas as pd
from flask import jsonify, request
from src import app


def read_final():
    df = pd.read_csv('data/final_testing_expense.csv')
    df.columns = df.columns.str.strip()  # Remove any hidden whitespace
    return df


@app.route('/api/education-data', methods=['GET'])
def toggle():
    toggle_value = request.args.get('toggle_value')

    if toggle_value == 'funding':
        data = funding_map()
    else:
        data = testing_map()

    return jsonify(data)


def funding_map():
    df = read_final()
    return {
        row['County Name']: {
            'Expense per Child': row['Expense per ADA']
        }
        for _, row in df.iterrows()
        if row['County Name'] != 'Alpine'
    }


def testing_map():
    df = read_final()
    return {
        row['County Name']: {
            'Mean Score': row['Mean Scale Score'],
            'Percentage Passed': row['Percentage Standard Met and Above'],
            'Value': row['Test Calculated Value']
        }
        for _, row in df.iterrows()
        if row['County Name'] != 'Alpine'
    }
