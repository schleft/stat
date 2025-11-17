from flask import Blueprint, render_template, request, redirect, url_for
from models import db, Match, Team, Player, Roster

rosters_bp = Blueprint('rosters', __name__, template_folder='../templates/rosters')

@rosters_bp.route('/match/<int:match_id>/roster', methods=['GET'])
def edit_roster(match_id):
    match = Match.query.get_or_404(match_id)
    teams = [match.home_team, match.away_team]  # supposons que Match a home_team / away_team
    # Récupère tous les joueurs par équipe pour l'autocomplétion
    players_by_team = {team.id: team.players for team in teams}

    # Récupérer le roster existant si déjà rempli
    roster = Roster.query.filter_by(match_id=match_id).all()
    roster_dict = {}
    for r in roster:
        roster_dict.setdefault(r.team_id, []).append(r)

    return render_template(
        'rosters/roster_form.html',
        match=match,
        teams=teams,
        players_by_team=players_by_team,
        roster_dict=roster_dict
    )
    
@rosters_bp.route('/match/<int:match_id>/roster', methods=['POST'])
def save_roster(match_id):
    match = Match.query.get_or_404(match_id)

    # Suppression du roster existant pour ce match (facile à gérer)
    Roster.query.filter_by(match_id=match_id).delete()

    # Traitement du formulaire
    roster_data = request.form.to_dict(flat=False)
    # roster_data doit contenir un dict comme :
    # roster_data['team_1_order_1'] = player_id
    # roster_data['team_1_sub_1'] = player_id
    # etc.

    for key, values in roster_data.items():
        # key = "team_{team_id}_order_{i}" ou "team_{team_id}_sub_{i}"
        parts = key.split('_')
        team_id = int(parts[1])
        if parts[2] == 'order':
            roster_order = int(parts[3])
        else:
            roster_order = None  # remplaçant

        for value in values:  # on peut avoir plusieurs inputs avec le même name
            player_id = int(value)
            number = request.form.get(f"{key}_number_{value}", None)
            position = request.form.get(f"{key}_position_{value}", None)

            r = Roster(
                match_id=match_id,
                team_id=team_id,
                player_id=player_id,
                roster_order=roster_order,
                number=number,
                position=position
            )
            db.session.add(r)

    db.session.commit()
    return redirect(url_for('match_detail', match_id=match_id))
