from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

model = joblib.load('model.pkl')

flight_info = {
    "total_seats": None,
    "avg_tickets": None,
    "sold_tickets": 0,
    "yes_count": 0,
    "no_count": 0,
    "coefficient": 1.0
}

@app.route('/reset', methods=['POST'])
def reset():
    global flight_info
    flight_info = {
        "total_seats": None,
        "avg_tickets": None,
        "sold_tickets": 0,
        "yes_count": 0,
        "no_count": 0,
        "coefficient": 1.0
    }
    return jsonify({"status": "success"})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/set_flight_info', methods=['POST'])
def set_flight_info():
    global flight_info
    data = request.json
    logger.debug(f"Received flight info: {data}")

    flight_info["total_seats"] = int(data["total_seats"])
    flight_info["avg_tickets"] = int(data["avg_tickets"])
    return jsonify({"status": "success"})

@app.route('/check_sales', methods=['GET'])
def check_sales():
    global flight_info
    
    if flight_info["avg_tickets"] is None or flight_info["total_seats"] is None:
        return jsonify({
            'stop_sales': False,
            'expected_passengers': 0,
            'sold_tickets': 0
        })

    temp_no_count = flight_info["no_count"] + 1

    temp_coefficient = min(0.2 + (temp_no_count / flight_info["avg_tickets"]), 0.85)

    temp_expected_passengers = flight_info["yes_count"] + (temp_no_count * temp_coefficient)

    stop_sales = (temp_expected_passengers >= flight_info["total_seats"]) or (flight_info["sold_tickets"] + 1 >= flight_info["avg_tickets"] * 1.04)

    return jsonify({
        'stop_sales': stop_sales,
        'expected_passengers': temp_expected_passengers,
        'sold_tickets': flight_info["sold_tickets"]
    })

@app.route('/predict', methods=['POST'])
def predict():
    global flight_info
    data = request.json
    logger.debug(f"Received data for prediction: {data}")

    input_data = pd.DataFrame({
        'gender': [data['gender']],
        'age': [int(data['age'])],
        'flights': [int(data['flights'])],
        'missed': [int(data['missed'])],
        'cancelled': [int(data['cancelled'])],
        'returnable': [int(data['returnable'])],
        'luggage': [int(data['luggage'])],
        'type': [data['type']],
        'reason': [data['reason']]
    })

    input_data = pd.get_dummies(input_data, columns=['gender', 'type', 'reason'], drop_first=False)

    for col in model.feature_names_in_:
        if col not in input_data.columns:
            input_data[col] = 0

    input_data = input_data[model.feature_names_in_]

    logger.debug(f"Final input data for prediction:\n{input_data}")

    prediction = model.predict(input_data)[0]
    logger.debug(f"Prediction: {prediction}")

    if prediction == 1:
        flight_info["yes_count"] += 1
    else:
        flight_info["no_count"] += 1
        
    flight_info["sold_tickets"] += 1
        
    flight_info["coefficient"] = min(0.2 + (flight_info["no_count"] / flight_info["avg_tickets"]), 0.9)

    expected_passengers = flight_info["yes_count"] + (flight_info["no_count"] * flight_info["coefficient"])

    stop_sales = (expected_passengers >= flight_info["total_seats"]) or (flight_info["sold_tickets"] >= flight_info["avg_tickets"] * 1.04)

    logger.debug(f"Updated flight info: {flight_info}")
    logger.debug(f"summ {expected_passengers}")
    logger.debug(f"Stop sales: {stop_sales}")

    return jsonify({
        'prediction': int(prediction),
        'stop_sales': stop_sales,
        'expected_passengers': expected_passengers,
        'sold_tickets': flight_info["sold_tickets"],
        'yes_count': flight_info["yes_count"],
        'no_count': flight_info["no_count"]
    })

@app.route('/counts', methods=['GET'])
def get_counts():
    return jsonify(flight_info)

if __name__ == '__main__':
    app.run(debug=True)