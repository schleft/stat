from sqlalchemy import Table, Column, Integer, ForeignKey
from extensions import db

season_team = Table(
    'season_team',
    db.metadata,
    Column('season_id', Integer, ForeignKey('season.id'), primary_key=True),
    Column('team_id', Integer, ForeignKey('team.id'), primary_key=True)
)