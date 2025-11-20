const currentBattingTeam = document.getElementById('currentBattingTeam');
const currentDefendingTeam = document.getElementById('currentDefendingTeam'); 

/**
 * Met à jour l'affichage de l'état du jeu (Manche, Outs, Équipe au bâton, et le terrain).
 */
function updateGameDisplay() {
    const inningText = `Inning ${currentInning} ${isTopInning ? 'Top' : 'Bottom'}`;
    
    const battingRoster = isTopInning ? awayRoster : homeRoster;
    const defendingRoster = isTopInning ? homeRoster : awayRoster;
    
    const battingTeamName = battingRoster.length > 0 ? battingRoster[0].team_name : 'N/A';
    const defendingTeamName = defendingRoster.length > 0 ? defendingRoster[0].team_name : 'N/A';
    const teamType = isTopInning ? 'Visiteur' : 'Domicile';
    
    currentBattingTeamRoster = battingRoster;
    currentInningDisplay.textContent = inningText;
    currentBattingTeam.innerHTML = `${battingTeamName}`; 
    currentDefendingTeam.textContent = defendingTeamName; 

    // Cacher tous les cercles rouges
    document.querySelectorAll('.circle-red').forEach(circle => {
        circle.style.display = 'none';
    });
    // Afficher tous les cercles rouges
    document.querySelectorAll('.circle-empty').forEach(circle => {
        circle.style.display = 'inline-block';
    });

    if (currentOuts >= 1) {
        document.querySelector('.out1.circle-red').style.display = 'inline-block';
        document.querySelector('.out1.circle-empty').style.display = 'none';
    }

    if (currentOuts >= 2) {
        document.querySelector('.out2.circle-red').style.display = 'inline-block';
        document.querySelector('.out2.circle-empty').style.display = 'none';
    }

    if (currentOuts >= 3) {
        document.querySelector('.out3.circle-red').style.display = 'inline-block';
        document.querySelector('.out3.circle-empty').style.display = 'none';
    }
    
    populateBatterSelect(matchPlays);
    updateFieldDiagram(); 
}