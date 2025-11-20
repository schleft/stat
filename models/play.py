import json
from flask_sqlalchemy import SQLAlchemy
from extensions import db  # Assurez-vous que 'extensions' est bien configuré

class Play(db.Model):
    __tablename__ = 'play'
    
    # --- CONTEXTE ET CLÉS ---
    play_id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('match.id'), nullable=False)
    play_number = db.Column(db.Integer, nullable=False)
    
    # --- ÉTAT DU JEU ---
    inning = db.Column(db.Integer, nullable=False)
    is_top_inning = db.Column(db.Boolean, nullable=False)  # True pour Top, False pour Bottom
    initial_outs = db.Column(db.Integer, nullable=False)
    
    # --- BATTEUR ET ACTION ---
    batter_roster_order = db.Column(db.Integer, nullable=False)
    batter_team_id = db.Column(db.Integer, nullable=False) # ID de l'équipe au bâton
    action_code = db.Column(db.String(10), nullable=False) # Ex: '1B', 'HR', 'GO', 'BB', 'SB'
    defensive_code = db.Column(db.String(50), nullable=False) # Ex: '6-4-3', 'E6', 'F8' (Obligatoire)
    
    # --- RÉSULTATS ---
    outs_generated = db.Column(db.Integer, nullable=False)
    runs_scored_on_play = db.Column(db.Integer, nullable=False)
    
    # --- ÉTAT INITIAL DES BASES ---
    # Stocke le roster_order du coureur (ou NULL)
    initial_state_1b = db.Column(db.Integer, nullable=True)
    initial_state_2b = db.Column(db.Integer, nullable=True)
    initial_state_3b = db.Column(db.Integer, nullable=True)
    
    # --- DONNÉES COMPLEXES (JSON/TEXT) ---
    # Liste des défenseurs impliqués (ID, position)
    defenders_involved_json = db.Column(db.Text, nullable=False)
    # Liste des mouvements des coureurs (départ, arrivée, point, out)
    runner_movements_json = db.Column(db.Text, nullable=False)

    # --- RELATIONS ---
    # Relation avec la table Match (pour accéder aux données du match)
    match = db.relationship('Match', backref=db.backref('plays', lazy=True))

    def __init__(self, **kwargs):
        """
        Initialise l'objet et convertit les listes Python complexes 
        en chaînes JSON pour le stockage.
        """
        if 'defenders_involved' in kwargs:
            kwargs['defenders_involved_json'] = json.dumps(kwargs.pop('defenders_involved'))
        
        if 'runner_movements' in kwargs:
            kwargs['runner_movements_json'] = json.dumps(kwargs.pop('runner_movements'))
            
        super().__init__(**kwargs)

    @property
    def defenders_involved(self):
        """Retourne la liste des défenseurs en tant qu'objet Python."""
        return json.loads(self.defenders_involved_json) if self.defenders_involved_json else []

    @property
    def runner_movements(self):
        """Retourne la liste des mouvements des coureurs en tant qu'objet Python."""
        return json.loads(self.runner_movements_json) if self.runner_movements_json else []

    def __repr__(self):
        return f"<Play {self.play_id} - {self.action_code}>"