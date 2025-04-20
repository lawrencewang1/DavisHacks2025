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
    print(f"[BACKEND] Toggle selected: {toggle_value}")

    if toggle_value == 'funding':
        data = funding_map()
    else:
        data = testing_map()

    # Print sample for debugging
    first = list(data.items())[0]
    print(f"[BACKEND] Sample for {toggle_value}: {first}")

    return jsonify(data)


def funding_map():
    df = read_final()
    return {
        row['County Name']: row['Expense per ADA']
        for _, row in df.iterrows()
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
    }
