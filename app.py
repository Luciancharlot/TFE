from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
import urllib

app = Flask(__name__)

# Configuration de la base de données SQL Server
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modèles SQLAlchemy
class BeerTypes(db.Model):
    __tablename__ = 'Beer_Types'
    type_id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String(255))

class Beers(db.Model):
    __tablename__ = 'Beers'
    beer_id = db.Column(db.Integer, primary_key=True)
    beer_name = db.Column(db.String(255))

class Preferences(db.Model):
    __tablename__ = 'Preferences'
    preference_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    preference_type = db.Column(db.Integer)  # Clé étrangère vers Beer_Types
    bitterness = db.Column(db.Integer)
    sweetness = db.Column(db.Integer)
    fruitness = db.Column(db.Integer)
    alcohol_content = db.Column(db.Integer)
    preference_beer = db.Column(db.Integer)  # Clé étrangère vers Beers

# Route pour afficher le formulaire
@app.route('/')
def home():
    return render_template('index.html')

# API pour rechercher les types de bière
@app.route('/search_beer_types', methods=['GET'])
def search_beer_types():
    query = request.args.get('q', '')
    results = BeerTypes.query.filter(BeerTypes.type_name.ilike(f'%{query}%')).all()
    return jsonify([{'type_id': r.type_id, 'type_name': r.type_name} for r in results])

# API pour rechercher les bières
@app.route('/search_beers', methods=['GET'])
def search_beers():
    query = request.args.get('q', '')
    results = Beers.query.filter(Beers.beer_name.ilike(f'%{query}%')).all()
    return jsonify([{'beer_id': r.beer_id, 'beer_name': r.beer_name} for r in results])

# Route pour traiter les préférences soumises via le formulaire
@app.route('/submit_preferences', methods=['POST'])
def submit_preferences():
    user_id = request.form.get('user_id')  # Peut être vide si non fourni
    preference_type_name = request.form.get('preference_type')  # Nom du type de bière
    bitterness = request.form.get('bitterness')
    sweetness = request.form.get('sweetness')
    fruitness = request.form.get('fruitiness')
    alcohol_content = request.form.get('alcohol_content')
    preference_beer_name = request.form.get('preference_beer')  # Nom de la bière

    # Vérifier si le type de bière existe dans la base de données
    beer_type = BeerTypes.query.filter_by(type_name=preference_type_name).first()
    if not beer_type:
        return "Error: Type de bière introuvable", 400

    # Vérifier si la bière existe dans la base de données
    beer = Beers.query.filter_by(beer_name=preference_beer_name).first()
    if not beer:
        return "Error: Bière introuvable", 400

    # Insertion des données dans la table Preferences
    new_preference = Preferences(
        user_id=user_id if user_id else None,  # NULL si pas d'utilisateur
        preference_type=beer_type.type_id,  # Utilise l'ID du type de bière
        bitterness=bitterness,
        sweetness=sweetness,
        fruitness=fruitness,
        alcohol_content=alcohol_content,
        preference_beer=beer.beer_id  # Utilise l'ID de la bière
    )

    db.session.add(new_preference)
    db.session.commit()

    return jsonify({
        'message': 'Preferences received!',
        'preference_type': beer_type.type_name,
        'bitterness': bitterness,
        'sweetness': sweetness,
        'fruitness': fruitness,
        'alcohol_content': alcohol_content,
        'preference_beer': beer.beer_name
    })

if __name__ == '__main__':
    app.run(debug=True)
