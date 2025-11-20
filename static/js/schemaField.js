// ------------------------------------------------------------------
// GESTION DU DIAGRAMME DU TERRAIN
// ------------------------------------------------------------------

/**
 * Met à jour le diagramme du terrain (défense et coureurs).
 */
function updateFieldDiagram() {
    const defendingRoster = isTopInning ? homeRoster : awayRoster;
    const battingTeamId = isTopInning ? AWAY_TEAM_ID : HOME_TEAM_ID;
    
    const positionCodeMapText = {
        'player-P': 'P', 'player-C': 'C', 'player-1B': '1B', 'player-2B': '2B',
        'player-3B': '3B', 'player-SS': 'SS', 'player-LF': 'LF', 'player-CF': 'CF', 'player-RF': 'RF',
    };
    
    const positionCodeToNumberStringMap = {
        'P': '1', 'C': '2', '1B': '3', '2B': '4', '3B': '5', 'SS': '6', 'LF': '7', 'CF': '8', 'RF': '9'
    };

    // 1. Mise à jour des joueurs défensifs
    Object.keys(positionCodeMapText).forEach(playerId => {
        const positionCode = positionCodeMapText[playerId]; 
        const positionNumber = positionCodeToNumberStringMap[positionCode]; 
        const el = document.getElementById(playerId);
        
        // Trouver le joueur dans le roster par son numéro de position
        const playerEntry = defendingRoster.find(entry => String(entry.position) === positionNumber);
        
        if (el) {
            if (playerEntry && playerEntry.player) {
                const playerName = playerEntry.player.first_name + " " + playerEntry.player.last_name[0] + ".";
                const code = positionNumber || '?';
                el.innerHTML = `<div>${positionCode} (${code})</div><div>${playerName}</div>`;
            } else {
                const code = positionNumber || '?';
                el.innerHTML = `<div>${positionCode} (${code})</div><div>(VIDE)</div>`;
            }
        }
    });

    // 2. Mise à jour de l'état des bases (coureurs)
    Object.keys(baseState).forEach(baseId => {
        const runnerRosterOrder = baseState[baseId];
        const baseEl = document.getElementById(`base-${baseId.charAt(0)}-visuel`);
        const nameEl = document.getElementById(`runner-${baseId}`);

        if (baseEl) {
            baseEl.classList.remove('occupied');

            if (runnerRosterOrder) {
                baseEl.classList.add('occupied');
                const runnerFullName = getRunnerName(runnerRosterOrder, battingTeamId);
                nameEl.textContent = runnerFullName; 
            } else {
                nameEl.textContent = '';
            }
        }
    });
}