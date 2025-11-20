from flask import Blueprint, render_template, request, redirect, url_for, flash
from models.match import Match, db
from models.season import Season
from models.team import Team
from models.player import Player
from datetime import datetime

matches_bp = Blueprint('matches', __name__, template_folder='../templates/matches')

# Liste des matches
@matches_bp.route('/matches')
def list_matches():
    matches = Match.query.order_by(Match.date.desc()).all()
    seasons = Season.query.all()
    teams = Team.query.all()
    players = Player.query.all()
    return render_template('matches/list_matches.html', matches=matches, seasons=seasons, teams=teams, players=players)

# Créer un match
@matches_bp.route('/matches/create', methods=['GET', 'POST'])
def create_match():
    seasons = Season.query.all()
    teams = Team.query.all()
    players = Player.query.all()

    if request.method == 'POST':
        season_id = request.form.get('season_id')
        home_team_id = request.form.get('home_team_id')
        away_team_id = request.form.get('away_team_id')
        date_str = request.form.get('date')

        # Récupération des IDs des arbitres et scoreur
        arbitre1_id = request.form.get('arbitre1_id')
        arbitre2_id = request.form.get('arbitre2_id')
        scoreur_id = request.form.get('scoreur_id')

        # Vérifier que les joueurs existent
        arbitre1 = Player.query.get(arbitre1_id)
        if not arbitre1:
            flash("L'arbitre 1 sélectionné n'existe pas.", "error")
            return render_template('matches/match_form.html', match=None, seasons=seasons, teams=teams, players=players)

        arbitre2 = Player.query.get(arbitre2_id) if arbitre2_id else None
        if arbitre2_id and not arbitre2:
            flash("L'arbitre 2 sélectionné n'existe pas.", "error")
            return render_template('matches/match_form.html', match=None, seasons=seasons, teams=teams, players=players)

        scoreur = Player.query.get(scoreur_id) if scoreur_id else None
        if scoreur_id and not scoreur:
            flash("Le scoreur sélectionné n'existe pas.", "error")
            return render_template('matches/match_form.html', match=None, seasons=seasons, teams=teams, players=players)

        # Vérifier que ce ne sont pas les mêmes équipes
        if home_team_id == away_team_id:
            flash("L'équipe à domicile et l'équipe visiteuse doivent être différentes.", "error")
            return render_template('matches/match_form.html', match=None, seasons=seasons, teams=teams, players=players)

        # Conversion de la date
        date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

        match = Match(
            season_id=int(season_id),
            home_team_id=int(home_team_id),
            away_team_id=int(away_team_id),
            date=date,
            arbitre1_id=arbitre1.id,
            arbitre2_id=arbitre2.id if arbitre2 else None,
            scoreur_id=scoreur.id if scoreur else None
        )

        db.session.add(match)
        db.session.commit()
        return redirect(url_for('rosters.edit_roster', match_id=match.id))

    return render_template('matches/match_form.html', match=None, seasons=seasons, teams=teams, players=players)


# Modifier un match
@matches_bp.route('/matches/edit/<int:match_id>', methods=['GET', 'POST'])
def edit_match(match_id):
    match = Match.query.get_or_404(match_id)
    seasons = Season.query.all()
    teams = Team.query.all()
    players = Player.query.all()

    if request.method == 'POST':
        home_team_id = request.form.get('home_team_id')
        away_team_id = request.form.get('away_team_id')

        # Vérification équipes différentes
        if home_team_id == away_team_id:
            flash("L'équipe à domicile et l'équipe visiteuse doivent être différentes.", "error")
            return render_template('matches/match_form.html', match=match, seasons=seasons, teams=teams, players=players, getattr=getattr)

        match.season_id = int(request.form.get('season_id'))
        match.home_team_id = int(home_team_id)
        match.away_team_id = int(away_team_id)
        date_str = request.form.get('date')
        match.date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

        # Récupération des IDs des arbitres et scoreur
        arbitre1_id = request.form.get('arbitre1_id')
        arbitre2_id = request.form.get('arbitre2_id')
        scoreur_id = request.form.get('scoreur_id')

        # Vérification joueurs
        arbitre1 = Player.query.get(arbitre1_id)
        if not arbitre1:
            flash("L'arbitre 1 sélectionné n'existe pas.", "error")
            return render_template('matches/match_form.html', match=match, seasons=seasons, teams=teams, players=players, getattr=getattr)

        arbitre2 = Player.query.get(arbitre2_id) if arbitre2_id else None
        if arbitre2_id and not arbitre2:
            flash("L'arbitre 2 sélectionné n'existe pas.", "error")
            return render_template('matches/match_form.html', match=match, seasons=seasons, teams=teams, players=players, getattr=getattr)

        scoreur = Player.query.get(scoreur_id) if scoreur_id else None
        if scoreur_id and not scoreur:
            flash("Le scoreur sélectionné n'existe pas.", "error")
            return render_template('matches/match_form.html', match=match, seasons=seasons, teams=teams, players=players, getattr=getattr)

        match.arbitre1_id = arbitre1.id
        match.arbitre2_id = arbitre2.id if arbitre2 else None
        match.scoreur_id = scoreur.id if scoreur else None

        db.session.commit()
        return redirect(url_for('rosters.edit_roster', match_id=match_id))

    return render_template('matches/match_form.html', match=match, seasons=seasons, teams=teams, players=players, getattr=getattr)


# Supprimer un match
@matches_bp.route('/matches/delete/<int:match_id>', methods=['POST'])
def delete_match(match_id):
    match = Match.query.get_or_404(match_id)
    db.session.delete(match)
    db.session.commit()
    return redirect(url_for('matches.list_matches'))
