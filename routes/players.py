# routes/players.py
from flask import Blueprint, render_template, request, redirect, url_for
from models.player import Player, db
from models.team import Team

players_bp = Blueprint('players', __name__, template_folder='../templates/players')

# Liste des joueurs
@players_bp.route('/players')
def list_players():
    q = request.args.get('q', '').strip()
    team_filter = request.args.get('team', '').strip()
    
    players_query = Player.query

    # Filtrage par nom/prénom
    if q:
        players_query = players_query.filter(
            (Player.first_name.ilike(f"%{q}%")) |
            (Player.last_name.ilike(f"%{q}%"))
        )

    # Filtrage par équipe
    if team_filter:
        team = Team.query.filter_by(name=team_filter).first()
        if team:
            players_query = players_query.filter(Player.team_id == team.id)

    players = players_query.all()
    teams = Team.query.all()  # on envoie aussi la liste des équipes pour le filtre
    return render_template('admin/players/list_players.html', players=players, teams=teams)

# Créer un joueur
@players_bp.route('/players/create', methods=['GET', 'POST'])
def create_player():
    teams = Team.query.all()
    if request.method == 'POST':
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        number_raw = request.form.get('number')
        team_id = request.form.get('team_id')

        # Conversion sécurisée du numéro
        if number_raw and number_raw.isdigit():
            number = int(number_raw)
        else:
            number = None

        player = Player(
            first_name=first_name,
            last_name=last_name,
            number=number,
            team_id=int(team_id)
        )
        db.session.add(player)
        db.session.commit()
        return redirect(url_for('players.list_players'))

    return render_template('admin/players/player_form.html', teams=teams)

# Modifier un joueur
@players_bp.route('/players/edit/<int:player_id>', methods=['GET', 'POST'])
def edit_player(player_id):
    player = Player.query.get_or_404(player_id)
    teams = Team.query.all()
    if request.method == 'POST':
        player.first_name = request.form.get('first_name')
        player.last_name = request.form.get('last_name')
        number_raw = request.form.get('number')
        if number_raw and number_raw.isdigit():
            player.number = int(number_raw)
        else:
            player.number = None
        player.team_id = int(request.form.get('team_id'))

        db.session.commit()
        return redirect(url_for('players.list_players'))

    return render_template('admin/player_form.html', player=player, teams=teams)

# Supprimer un joueur
@players_bp.route('/players/delete/<int:player_id>', methods=['POST'])
def delete_player(player_id):
    player = Player.query.get_or_404(player_id)
    db.session.delete(player)
    db.session.commit()
    return redirect(url_for('players.list_players'))
