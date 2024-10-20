from flask import Flask, request, jsonify
import pickle
import numpy as np
import mysql.connector

app = Flask(__name__)

# Load your saved machine learning model
with open('iq_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Connect to MySQL
db = mysql.connector.connect(
    host="localhost",
    user="root",       # Replace with your MySQL username
    password="Happy!me",   # Replace with your MySQL password
    database="quizDB"
)

cursor = db.cursor(dictionary=True)

# Define a route for fetching questions
@app.route('/questions', methods=['GET'])
def get_questions():
    cursor.execute("SELECT * FROM questions")
    questions = cursor.fetchall()
    for question in questions:
        question['options'] = [question['option_a'], question['option_b'], question['option_c'], question['option_d']]
    return jsonify(questions)

# Define a route for predictions
@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json(force=True)
    responses = data['responses']
    # Extract features from responses
    correct = sum([r['correct'] for r in responses])
    total_questions = len(responses)
    avg_time = np.mean([r['time_taken'] for r in responses])
  
    input_features = np.array([[correct / total_questions, correct, avg_time]])
    prediction = model.predict(input_features)
    return jsonify({'iq_score': prediction[0]})

if __name__ == '__main__':
    app.run(debug=True,port=5001)