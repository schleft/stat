# routes/scoreCards.py

from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from extensions import db
from models.match import Match
from models.roster import Roster
from models.play import Play
import json # Assurez-vous d'importer json si ce n'est pas déjà fait

scoreCards_bp = Blueprint('scoreCards', __name__, template_folder='../templates/scoreCards')

# --- NOUVELLE FONCTION DE SÉRIALISATION (Simule Roster.to_dict()) ---
# ... (Fonction serialize_roster_entry inchangée) ...
def serialize_roster_entry(roster_entry):
    """Convertit un objet Roster et ses relations Player/Team en dictionnaire."""
    
    # Récupère le nom de l'équipe (sécurité si team est chargé)
    team_name = roster_entry.team.name if hasattr(roster_entry, 'team') and roster_entry.team else None
    
    # Récupère les infos du joueur
    player_data = None
    if roster_entry.player:
        player_data = {
            'id': roster_entry.player.id,
            'first_name': roster_entry.player.first_name,
            'last_name': roster_entry.player.last_name,
        }
    
    roster_order = roster_entry.roster_order if roster_entry.roster_order is not None else 0
    
    return {
        'id': roster_entry.id,
        'player_id': roster_entry.player_id,
        'roster_order': roster_order,
        'team_id': roster_entry.team_id,
        'position': roster_entry.position if hasattr(roster_entry, 'position') else 'N/A',
        'player': player_data,
        'team_name': team_name
    }
# --------------------------------------------------------------------------

# --- NOUVEAUX HELPERS POUR LA GESTION DES PLAYS ---

def get_player_name_from_roster(roster_list, roster_order):
    """Recherche le nom du joueur dans la liste sérialisée des rosters."""
    if roster_order is None or roster_order == 0:
        return "N/A"
    
    roster_order = str(roster_order) 
    
    for entry in roster_list:
        if str(entry['roster_order']) == roster_order:
            if entry['player']:
                return f"{entry['player']['first_name']} {entry['player']['last_name'][0].upper()}."
            return "Ligne Vide"
    return "N/A"

def serialize_play(play, away_roster_serialized, home_roster_serialized):
    """Convertit un objet Play SQLAlchemy en dictionnaire pour le frontend JS."""
    
    # Déterminer le roster pour la recherche du nom du batteur
    roster_to_use = away_roster_serialized if play.is_top_inning else home_roster_serialized
    
    # Obtenir le nom du batteur
    batter_name = get_player_name_from_roster(roster_to_use, play.batter_roster_order)

    return {
        "inning": play.inning,
        "isTop": play.is_top_inning,
        "batter": {
            # Le JS attend des chaînes pour ces valeurs d'ordre
            "id": str(play.batter_roster_order) if play.batter_roster_order is not None else None,
            "name": batter_name,
            "rosterOrder": str(play.batter_roster_order) if play.batter_roster_order is not None else None,
            "teamId": play.batter_team_id
        },
        "action": play.action_code,
        "initialBaseState": {
            # Convertir les roster_orders (int/None) en chaînes (str/None) pour le JS
            "1B": str(play.initial_state_1b) if play.initial_state_1b is not None else None,
            "2B": str(play.initial_state_2b) if play.initial_state_2b is not None else None,
            "3B": str(play.initial_state_3b) if play.initial_state_3b is not None else None,
        },
        "initialOuts": play.initial_outs,
        # runner_movements utilise la propriété qui dé-sérialise le JSON
        "movements": play.runner_movements, 
        "defensiveCode": play.defensive_code,
        "outsGenerated": play.outs_generated,
        "runsScored": play.runs_scored_on_play # runs_scored_on_play
    }
# --------------------------------------------------------------------------


@scoreCards_bp.route('/match/<int:match_id>/scoreCards', methods=['GET', 'POST'])
def edit_scoreCard(match_id):
    # 1. Récupérer l'objet Match
    match = Match.query.options(
        db.joinedload(Match.home_team),
        db.joinedload(Match.away_team)
    ).get_or_404(match_id)

    # --- GESTION DE LA SOUMISSION D'UNE NOUVELLE ACTION (POST) ---
    if request.method == 'POST':
        try:
            data = request.get_json()

            if not data:
                return jsonify({'error': 'Données JSON manquantes.'}), 400

            # 1. Déterminer le prochain play_number
            last_play = Play.query.filter_by(game_id=match_id).order_by(Play.play_number.desc()).first()
            play_number = (last_play.play_number if last_play else 0) + 1

            # 2. Préparer les données pour le modèle Play
            initial_bases = data.get('initialBaseState', {})
            batter_info = data.get('batter', {})
            
            # Gestion des conversions
            batter_roster_order = int(batter_info.get('rosterOrder')) if batter_info.get('rosterOrder') is not None and batter_info.get('rosterOrder') != 'null' else None
            batter_team_id = int(batter_info.get('teamId')) if batter_info.get('teamId') is not None else (match.away_team_id if data.get('isTop') else match.home_team_id)

            new_play = Play(
                game_id=match_id,
                play_number=play_number,
                inning=data.get('inning'),
                is_top_inning=data.get('isTop'),
                initial_outs=data.get('initialOuts'),
                
                # Le modèle Play exige un entier pour roster_order, 0 si Null pour une action de coureur seul
                batter_roster_order=batter_roster_order if batter_roster_order is not None else 0,
                batter_team_id=batter_team_id,
                action_code=data.get('action'),
                defensive_code=data.get('defensiveCode'), 
                
                outs_generated=data.get('outsGenerated'),
                runs_scored_on_play=data.get('runsScored'),
                
                # Bases initiales: convertir les chaînes JS en entiers Python (roster_order) ou None
                initial_state_1b=int(initial_bases.get('1B')) if initial_bases.get('1B') and initial_bases.get('1B') != 'null' else None,
                initial_state_2b=int(initial_bases.get('2B')) if initial_bases.get('2B') and initial_bases.get('2B') != 'null' else None,
                initial_state_3b=int(initial_bases.get('3B')) if initial_bases.get('3B') and initial_bases.get('3B') != 'null' else None,
                
                # runner_movements est automatiquement JSONifié par Play.__init__
                defenders_involved=[], # Laisser vide pour l'instant
                runner_movements=data.get('movements')
            )
            
            db.session.add(new_play)
            db.session.commit()
            
            return jsonify({
                'message': 'Action enregistrée avec succès.',
                'play_id': new_play.play_id,
                'play_number': new_play.play_number
            }), 201

        except Exception as e:
            db.session.rollback()
            print(f"Erreur lors de l'enregistrement de l'action: {e}")
            # L'erreur est renvoyée au JS pour affichage
            return jsonify({'error': f"Erreur serveur : {str(e)}"}), 500


    # --- GESTION DE L'AFFICHAGE DE LA PAGE (GET) ---

    # 2. Récupérer les rosters pour les deux équipes
    rosters = Roster.query.options(
        db.joinedload(Roster.player),
        db.joinedload(Roster.team) 
    ).filter(Roster.match_id == match_id).all()

    home_roster = sorted([r for r in rosters if r.team_id == match.home_team_id and r.roster_order is not None], key=lambda x: x.roster_order)
    away_roster = sorted([r for r in rosters if r.team_id == match.away_team_id and r.roster_order is not None], key=lambda x: x.roster_order)
    
    # Remplir le roster des titulaires (pad_roster doit être défini dans votre contexte)
    def pad_roster(roster, team_id):
        # ... (La fonction MockRoster/pad_roster fournie précédemment par l'utilisateur) ...
        padded = roster[:]
        for i in range(len(roster) + 1, 10):
            # Créer des entrées Roster TEMPORAIRES (simulées) pour les lignes vides
            class MockRoster:
                def __init__(self, match_id, team_id, roster_order):
                    self.id = None
                    self.player_id = None
                    self.roster_order = roster_order
                    self.team_id = team_id
                    self.player = None
                    self.position = 'N/A' # Par défaut pour les lignes vides
                    self.team = match.home_team if team_id == match.home_team_id else match.away_team
            
            empty_roster_entry = MockRoster(match_id, team_id, i)
            padded.append(empty_roster_entry)
        return padded
    
    home_roster_padded = pad_roster(home_roster, match.home_team_id)
    away_roster_padded = pad_roster(away_roster, match.away_team_id)

    # 3. SÉRIALISATION DES ROSTERS
    home_roster_serialized = [serialize_roster_entry(r) for r in home_roster_padded]
    away_roster_serialized = [serialize_roster_entry(r) for r in away_roster_padded]
    
    # 4. NOUVEAU: Récupération et sérialisation de l'historique des plays
    plays = Play.query.filter_by(game_id=match_id).order_by(Play.play_number).all()

    match_plays = [
        serialize_play(play, away_roster_serialized, home_roster_serialized) 
        for play in plays
    ]

    # 5. Rendre le template avec les listes de dictionnaires sérialisées et l'historique
    return render_template(
        'scoreCards/scoreCard_form.html',
        match=match,
        home_team=match.home_team,
        away_team=match.away_team,
        home_roster=home_roster_serialized, 
        away_roster=away_roster_serialized,
        match_plays=match_plays # <-- Historique passé au frontend
    )