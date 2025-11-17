from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(20))
    team_home = db.Column(db.String(50))
    team_away = db.Column(db.String(50))
    score_home = db.Column(db.Integer)
    score_away = db.Column(db.Integer)
    hits_home = db.Column(db.Integer)
    hits_away = db.Column(db.Integer)
    hr_home = db.Column(db.Integer)
    hr_away = db.Column(db.Integer)

    # relation vers stats pitcher
    pitcher_stats = db.relationship("PitcherStats", backref="match", uselist=False)

class PitcherStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey("match.id"))
    pitcher_name = db.Column(db.String(50))
    innings_pitched = db.Column(db.Float)
    strikeouts = db.Column(db.Integer)
    walks = db.Column(db.Integer)
    earned_runs = db.Column(db.Integer)
