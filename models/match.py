from flask_sqlalchemy import SQLAlchemy
from extensions import db

class Match(db.Model):
    __tablename__ = 'match'
    id = db.Column(db.Integer, primary_key=True)
    season_id = db.Column(db.Integer, db.ForeignKey('season.id'))
    home_team_id = db.Column(db.Integer, db.ForeignKey('team.id'))
    away_team_id = db.Column(db.Integer, db.ForeignKey('team.id'))
    date = db.Column(db.Date, nullable=False)

    # Arbitres et scoreur liés à Player
    arbitre1_id = db.Column(db.Integer, db.ForeignKey('player.id'))
    arbitre2_id = db.Column(db.Integer, db.ForeignKey('player.id'))
    scoreur_id  = db.Column(db.Integer, db.ForeignKey('player.id'))

    # Relations pour accéder aux objets Team et Season
    home_team = db.relationship('Team', foreign_keys=[home_team_id])
    away_team = db.relationship('Team', foreign_keys=[away_team_id])
    season = db.relationship('Season', backref='matches')

    arbitre1 = db.relationship('Player', foreign_keys=[arbitre1_id])
    arbitre2 = db.relationship('Player', foreign_keys=[arbitre2_id])
    scoreur = db.relationship('Player', foreign_keys=[scoreur_id])
    
    # Relation inverse
    roster = db.relationship('Roster', back_populates='match', cascade='all, delete-orphan')