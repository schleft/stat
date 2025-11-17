
from extensions import db
from models.season_team import season_team
from models.team import Team

class Season(db.Model):
    __tablename__ = 'season'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50))
    year = db.Column(db.Integer)
    discipline = db.Column(db.String(50))

    teams = db.relationship('Team', secondary=season_team, back_populates='seasons')
