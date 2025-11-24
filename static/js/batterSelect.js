/**
 * Initialise et peuple le sélecteur du batteur, gérant l'avancement.
 */
function populateBatterSelect(plays) {
    let currentRosterOrder = 0;

    batterSelect.innerHTML = "";

    const activeRoster = currentBattingTeamRoster.filter(entry => entry.roster_order !== 0 && entry.roster_order !== null);
    
    activeRoster.forEach((entry) => {
        const option = document.createElement('option');
        // Assure que la valeur de l'option est une chaîne (même si entry.roster_order est un nombre)
        option.value = String(entry.roster_order);
        const playerName = entry.player ? `${entry.player.first_name} ${entry.player.last_name[0]}.` : 'Ligne Vide';
        option.textContent = `${entry.roster_order}. ${playerName} (${entry.position || 'N/A'})`;
        option.dataset.rosterOrder = entry.roster_order;
        option.dataset.teamId = entry.team_id;
        option.dataset.playerName = playerName;
        
        if (entry.player_id === null) {
            option.disabled = true;
        }

        batterSelect.appendChild(option);
    });
    
    // Si le dernier play n'est pas dans la même manche,
    // on récupère le dernier batteur a avoir joué dans l'autre équipe
    currentRosterOrder = 0; // Dans le cas ou aucun batteur n'est passé (1ère manche)
    for (let i = plays.length - 1; i >= 0; i--) {
        if (plays[i].isTop == isTopInning) {
            currentRosterOrder = parseInt(plays[i].batter.rosterOrder);
            break;
        }   
    }
    
    if(currentRosterOrder == 9) {
        batterSelect.value = 1+"";
    } else {
        batterSelect.value = String(currentRosterOrder+1);
    }
}