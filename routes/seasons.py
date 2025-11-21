from flask import Blueprint, render_template, request, redirect, url_for
from models.season import Season
from models.team import Team
from extensions import db

seasons_bp = Blueprint('seasons', __name__, template_folder='../templates/seasons')

@seasons_bp.route('/seasons')
def list_seasons():
    seasons = Season.query.all()
    return render_template('admin/seasons/list_seasons.html', seasons=seasons)

@seasons_bp.route('/create_season', methods=['GET', 'POST'])
def create_season():
    teams = Team.query.all()
    if request.method == 'POST':
        name = request.form.get('name')
        category = request.form.get('category')
        year = request.form.get('year')
        discipline = request.form.get('discipline')
        selected_team_ids = request.form.getlist('teams')  # Liste des ids sélectionnés

        season = Season(name=name, category=category, year=year, discipline=discipline)
        
        # Ajouter les équipes sélectionnées
        for team_id in selected_team_ids:
            team = Team.query.get(int(team_id))
            if team and team not in season.teams:
                season.teams.append(team)

        db.session.add(season)
        db.session.commit()
        return redirect(url_for('seasons.list_seasons'))

    return render_template('admin/seasons/season_form.html', teams=teams, season=None)

@seasons_bp.route('/edit_season/<int:season_id>', methods=['GET', 'POST'])
def edit_season(season_id):
    season = Season.query.get_or_404(season_id)
    teams = Team.query.all()
    
    if request.method == 'POST':
        season.name = request.form.get('name')
        season.category = request.form.get('category')
        season.year = request.form.get('year')
        season.discipline = request.form.get('discipline')
        
        selected_team_ids = request.form.getlist('teams') or []
        
        # Réinitialiser la liste des équipes pour éviter les doublons
        season.teams = []
        for team_id in selected_team_ids:
            team = Team.query.get(int(team_id))
            if team and team not in season.teams:
                season.teams.append(team)
        
        db.session.commit()
        return redirect(url_for('seasons.list_seasons'))

    return render_template('admin/seasons/season_form.html', season=season, teams=teams)

@seasons_bp.route('/delete_season/<int:season_id>', methods=['POST'])
def delete_season(season_id):
    season = Season.query.get_or_404(season_id)
    db.session.delete(season)
    db.session.commit()
    return redirect(url_for('seasons.list_seasons'))
