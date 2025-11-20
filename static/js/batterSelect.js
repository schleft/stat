/**
 * Initialise et peuple le sélecteur du batteur, gérant l'avancement.
 */
function populateBatterSelect(plays) {
    // La valeur actuelle est le prochain batteur calculé par loadMatchHistory/internalAdvanceGame
    let currentRosterOrder = parseInt(batterSelect.value, 10);
    if (isNaN(currentRosterOrder) || currentRosterOrder === 0) {
        //currentRosterOrder = 1;
        currentRosterOrder = parseInt(plays[plays.length - 1]["batter"]["rosterOrder"]); 
    }
    
    //batterSelect.innerHTML = '';
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
    
    // Rétablit la valeur correcte (doit être une chaîne)

    /*if (activeRoster.some(entry => entry.roster_order === currentRosterOrder)) {
        console.log(currentRosterOrder);
        batterSelect.value = String(currentRosterOrder);
    } else if (activeRoster.length > 0) {
        console.log(currentRosterOrder);
        batterSelect.value = String(activeRoster[0].roster_order);
    }*/
    batterSelect.value = String(currentRosterOrder+1);
}