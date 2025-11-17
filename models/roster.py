from flask_sqlalchemy import SQLAlchemy
from extensions import db

class Roster(db.Model):
    __tablename__ = 'roster'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)
    
    position = db.Column(db.String(50), nullable=True)
    roster_order = db.Column(db.Integer, nullable=True)  # NULL si remplaçant
    number = db.Column(db.Integer, nullable=True)

    # Relations (facultatives)
    match = db.relationship('Match', back_populates='roster')
    team = db.relationship('Team', backref=db.backref('roster', cascade='all, delete-orphan'))
    player = db.relationship('Player', backref=db.backref('roster', cascade='all, delete-orphan'))

    def __repr__(self):
        if self.roster_order:
            type_player = f"Titulaire {self.roster_order}"
        else:
            type_player = "Remplaçant"
        return f"<Roster {type_player} - {self.player_id} - Match {self.match_id} - Team {self.team_id}>"
