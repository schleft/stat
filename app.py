from flask import Flask, render_template
from extensions import db
import os

app = Flask(__name__)

# A changer en prod
app.secret_key = 'une_valeur_secrete_super_longue_et_unique'

# --- Création de l'application ---
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///baseball.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Initialisation de l'extension ---
db.init_app(app)

# --- Import des modèles après db.init_app pour éviter les circular imports ---
from models.team import Team
from models.player import Player
from models.season import Season
from models.match import Match
from models.roster import Roster

# --- Import des Blueprints (routes) ---
from routes.teams import teams_bp
from routes.players import players_bp
from routes.seasons import seasons_bp
from routes.matchs import matches_bp
from routes.rosters import rosters_bp

# --- Enregistrement des Blueprints ---
app.register_blueprint(players_bp)
app.register_blueprint(teams_bp)
app.register_blueprint(seasons_bp)
app.register_blueprint(matches_bp)
app.register_blueprint(rosters_bp)

# --- Route accueil ---
@app.route('/')
def home():
    return render_template('home.html')

# --- Lancement de l'application ---
if __name__ == "__main__":
    # Crée le dossier uploads si inexistant
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)
