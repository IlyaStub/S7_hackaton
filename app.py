from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
import logging

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# Загрузка модели
model = joblib.load('model.pkl')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    logging.debug(f"Received data: {data}")

    # Создаём DataFrame
    input_data = pd.DataFrame({
        'gender': [data['gender']],
        'age': [int(data['age'])],
        'flights': [int(data['flights'])],
        'missed': [int(data['missed'])],
        'reason': [data['reason']]
    })

    # Кодируем категориальные признаки
    input_data = pd.get_dummies(input_data, columns=['gender', 'reason'], drop_first=False)

    # Убедимся, что признак "reason_work" добавился
    logging.debug(f"After encoding: {input_data}")

    # Загружаем список признаков из модели
    expected_columns = model.feature_names_in_

    # Добавляем отсутствующие признаки
    for col in expected_columns:
        if col not in input_data.columns:
            input_data[col] = 0

    # Упорядочиваем столбцы
    input_data = input_data[expected_columns]

    logging.debug(f"Final input data for prediction:\n{input_data}")

    # Делаем предсказание
    prediction = model.predict(input_data)[0]
    logging.debug(f"Prediction: {prediction}")

    return jsonify({'prediction': int(prediction)})

if __name__ == '__main__':
    app.run(debug=True)
