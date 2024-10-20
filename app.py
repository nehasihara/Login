from flask import Flask, render_template

# Initialize Flask app
app = Flask(__name__)

# Route for the homepage
@app.route('/')
def index():
    return render_template('index.html')  # Connects to index.html

if __name__ == '__main__':
    app.run(debug=True)
