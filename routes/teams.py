from flask import Blueprint, render_template, request, redirect, url_for, current_app
from werkzeug.utils import secure_filename
import os

from models.team import Team, db

teams_bp = Blueprint('teams', __name__, template_folder='../templates/teams')

@teams_bp.route('/teams')
def list_teams():
    teams = Team.query.all()
    return render_template('list_teams.html', teams=teams)

@teams_bp.route('/create_team', methods=['GET', 'POST'])
def create_team():
    if request.method == 'POST':
        name = request.form.get('name')
        city = request.form.get('city')
        image_file = request.files.get('image')
        filename = None

        if image_file and image_file.filename != "":
            filename = secure_filename(image_file.filename)
            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
            image_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))

        team = Team(name=name, city=city, image=filename)
        db.session.add(team)
        db.session.commit()
        return redirect(url_for('teams.list_teams'))

    return render_template('team_form.html', team=None)

@teams_bp.route('/edit_team/<int:team_id>', methods=['GET', 'POST'])
def edit_team(team_id):
    team = Team.query.get_or_404(team_id)
    if request.method == 'POST':
        team.name = request.form.get('name')
        team.city = request.form.get('city')

        image_file = request.files.get('image')
        if image_file and image_file.filename != "":
            filename = secure_filename(image_file.filename)
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            image_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            team.image = filename

        db.session.commit()
        return redirect(url_for('teams.list_teams'))

    return render_template('team_form.html', team=team)

@teams_bp.route('/delete_team/<int:team_id>', methods=['POST'])
def delete_team(team_id):
    team = Team.query.get_or_404(team_id)
    db.session.delete(team)
    db.session.commit()
    return redirect(url_for('teams.list_teams'))

