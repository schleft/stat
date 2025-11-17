from flask_sqlalchemy import SQLAlchemy
from extensions import db

class Player(db.Model):
    __tablename__ = 'player'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    number = db.Column(db.Integer)

    # Ajout : image du joueur
    image_filename = db.Column(db.String(200), nullable=True)

    # Clé étrangère vers Team
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)

    # Relation inverse
    team = db.relationship('Team', back_populates='players')
