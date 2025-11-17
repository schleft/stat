
from extensions import db
from models.season_team import season_team  # <-- Import obligatoire ici
from models.player import Player

class Team(db.Model):
    __tablename__ = 'team'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    city = db.Column(db.String(50))
    image = db.Column(db.String(100))

    players = db.relationship('Player', back_populates='team', cascade="all, delete-orphan")
    seasons = db.relationship('Season', secondary=season_team, back_populates='teams')
