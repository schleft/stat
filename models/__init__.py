# models/__init__.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .team import Team
from .season import Season
from .player import Player
from .match import Match
from .roster import Roster
