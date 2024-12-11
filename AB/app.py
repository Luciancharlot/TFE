from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import urllib
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
# Configuration for SQL Server connection
params = urllib.parse.quote_plus("DRIVER={ODBC Driver 17 for SQL Server};"
                                 "SERVER=EL-COABITUS\TFE;DATABASE=TFE;"
                                 "Trusted_Connection=yes;")
app.config['SQLALCHEMY_DATABASE_URI'] = f"mssql+pyodbc:///?odbc_connect={params}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route('/')
def home():
    return "Flask server is running!"

# Define your Beer model
class Beer(db.Model):
    __tablename__ = 'Beers'
    beer_id = db.Column(db.Integer, primary_key=True)
    beer_name = db.Column(db.String)
    abv = db.Column(db.Float)
    brewery_id = db.Column(db.Integer)
    type_id = db.Column(db.Integer)
    beer_description = db.Column(db.String)

@app.route('/api/beers', methods=['GET'])
def get_beers():
    print("Fetching beer data...")
    beers = Beer.query.all()
    beer_list = [{
        'beer_id': beer.beer_id,
        'beer_name': beer.beer_name,
        'abv': beer.abv,
        'brewery_id': beer.brewery_id,
        'type_id': beer.type_id or None,
        'description': beer.beer_description or ""
    } for beer in beers]
    
    return jsonify(beer_list)

@app.route('/api/test_beers')
def test_beers():
    beers = Beer.query.all()
    return jsonify([beer.to_dict() for beer in beers])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
