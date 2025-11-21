from flask import Blueprint, render_template, request, redirect, url_for
from models.match import Match
from models.roster import Roster, db

rosters_bp = Blueprint('rosters', __name__, template_folder='../templates/rosters')

# Dans rosters_bp.py

@rosters_bp.route('/match/<int:match_id>/roster', methods=['GET'])
def edit_roster(match_id):
    match = Match.query.get_or_404(match_id)
    teams = [match.home_team, match.away_team]

    # Tous les joueurs par équipe pour l'autocomplétion
    players_by_team = {team.id: team.players for team in teams}

    # Roster existant pour ce match
    roster_items = Roster.query.filter_by(match_id=match_id).all()
    
    # 🌟 NOUVELLE LOGIQUE : Préparer le roster mappé
    roster_mapped = {}
    
    for r in roster_items:
        team_id = r.team_id
        if team_id not in roster_mapped:
            # Initialisation pour l'équipe
            roster_mapped[team_id] = {
                'starters': {}, # {1: RosterObject, 2: RosterObject, ...}
                'bench': []     # [RosterObject, RosterObject, ...]
            }
        
        if r.roster_order is not None and 1 <= r.roster_order <= 10:
            # Titulaire (mappé par ordre 1 à 10)
            roster_mapped[team_id]['starters'][r.roster_order] = r
        elif r.roster_order is None:
            # Remplaçant (ajouté à la liste des remplaçants)
            roster_mapped[team_id]['bench'].append(r)
    
    # trier les remplaçants par ID ou par nom si vous avez un ordre préféré, sinon l'ordre de la BDD suffit
    for team_id in roster_mapped:
        # Tri des remplaçants pour assurer la cohérence si nécessaire
        roster_mapped[team_id]['bench'].sort(key=lambda x: x.player.last_name if x.player else '')


    return render_template(
        'admin/rosters/roster_form.html',
        match=match,
        teams=teams,
        players_by_team=players_by_team,
        # ⚠️ Passer le nouveau dictionnaire mappé à la place de l'ancien roster_dict
        roster_mapped=roster_mapped 
    )

@rosters_bp.route('/match/<int:match_id>/roster', methods=['POST'])
def save_roster(match_id):
    match = Match.query.get_or_404(match_id)

    # Supprime l'ancien roster pour ce match
    Roster.query.filter_by(match_id=match_id).delete()
    
    # 💡 Correction : Utiliser request.form.items() car request.form.to_dict(flat=False)
    # 💡 renvoie une liste de valeurs pour chaque clé, même si le formulaire envoie une seule valeur.
    # 💡 Nous allons itérer sur les éléments du formulaire de manière plus classique et plus sûre ici.
    
    # Créer un dictionnaire pour stocker les éléments déjà traités et éviter les doublons
    processed_roster_inputs = {}

    # Itérer sur les clés du formulaire pour trouver les ID de joueurs
    for key, values in request.form.to_dict(flat=False).items():
        if not key.endswith('_id'):
            continue
            
        # Le request.form.to_dict(flat=False) renvoie une liste de valeurs, même pour un champ simple.
        # Nous prenons la première (et unique, normalement) valeur de la liste.
        player_id_str = values[0].strip() if values and values[0] else ''

        # Ignorer les entrées si l'ID du joueur est vide (champ laissé vide)
        if not player_id_str:
            continue
            
        # Vérifier si la valeur est la chaîne littérale 'None' ou la chaîne vide
        # et définir player_id à None si c'est le cas.
        if player_id_str.lower() == 'none' or not player_id_str:
            player_id = None
        else:
            try:
                # 🌟 CORRECTION CLÉ : Conversion en int seulement si la chaîne est valide
                player_id = int(player_id_str)
            except ValueError:
                # Cela devrait normalement ne pas arriver si la logique 'None' est correcte,
                # mais c'est une sécurité.
                player_id = None
                
        # Si le joueur ID n'est pas valide (None), on ignore cette ligne de roster.
        if player_id is None:
            continue

        # Extraction des autres informations (team_id, order, etc.)
        parts = key.split('_')
        role = parts[0] # 'starter' ou 'bench'
        team_id = int(parts[1])
        
        # Le 'order' pour le bench n'est pas pertinent, car il sera None.
        if role == 'starter':
            try:
                order = int(parts[2])
            except (IndexError, ValueError):
                order = None # Devrait être un nombre pour les starters, mais sécurité
        else:
            order = None # Remplaçant non assigné

        # Récupération des champs position et numéro (utilisez la clé complète)
        number = request.form.get(key.replace('_id', '_num'), None)
        position = request.form.get(key.replace('_id', '_pos'), None)
        
        # Nettoyage des chaînes vides ou 'None' pour les champs optionnels
        number = number.strip() if number and number.strip().lower() != 'none' else None
        position = position.strip() if position and position.strip().lower() != 'none' else None
        
        
        # 💡 S'assurer qu'on n'insère pas un doublon si la même entrée est traitée deux fois 
        # 💡 à cause de la structure du formulaire/itération (bien que la clé 'key' soit unique)
        roster_key = (team_id, player_id, order)
        if roster_key in processed_roster_inputs:
            continue
        processed_roster_inputs[roster_key] = True


        r = Roster(
            match_id=match_id,
            team_id=team_id,
            player_id=player_id,
            roster_order=order,
            number=number,
            position=position
        )
        db.session.add(r)

    db.session.commit()
    return redirect(url_for('scoreCards.edit_scoreCard', match_id=match_id)) # Assurez-vous que 'matches.list_matches' est la bonne URL