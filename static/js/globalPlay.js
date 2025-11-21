/**
 * Vérifie si au moins une base est occupée par un coureur.
 */
function hasRunnersOnBase() {
    return Object.values(baseState).some(runnerOrder => runnerOrder !== null);
}


/**
 * Crée une map Roster Order -> Joueur pour la recherche rapide.
 */
function buildRosterMap(roster) {
    roster.forEach(entry => {
        const key = `${entry.team_id}-${entry.roster_order}`;
        rosterMap[key] = entry;
    });
}

/**
 * Trouve le nom du joueur par son roster order et son équipe.
 */
function getRunnerName(rosterOrder, teamId) {
    const key = `${teamId}-${rosterOrder}`;
    const entry = rosterMap[key];
    
    if (entry && entry.player) {
        return `${entry.player.first_name} ${entry.player.last_name[0]}.`;
    }
    return `Joueur #${rosterOrder}`;
}

/**
 * Fournit un code défensif par défaut basé sur l'action au bâton.
 * @param {string} actionCode - Le code de l'action principale (ex: 'K', 'GO', '1B').
 * @returns {string} Le code défensif par défaut.
 */
function getDefaultDefensiveCode(actionCode) {
    switch (actionCode) {
        case 'GO':
            return ''; // SS vers 1B (exemple de ground out courant)
        case 'FO':
        case 'LO':
            return 'L'; // Line Out vers SS (exemple de line out courant)
        case '1B':
        case '2B':
        case '3B':
        case 'HR':
            return ''; // Hit - Code position/zone (Souvent marqué 'X' ou zone)
        default:
            return actionCode;
    }
}

/**
 * Fournit le nombre d'out par défaut pour une action
 * @param {string} actionCode - Le code de l'action principale (ex: 'K', 'GO', '1B').
 * @returns {string} Le code défensif par défaut.
 */
function getDefaultOutAction(actionCode) {
    switch (actionCode) {
        case 'KL':
            return 1;
        case 'KS':
            return 1;
        case 'GO':
            return 1;
        case 'FO':
            return 1;
        case 'LO':
            return 1;
        case 'FC':
            return 1;
        case 'CS':
            return 1;
        case 'WP':
            return 1;
        case 'PB':
            return 1;
        default:
            return 0;
    }
}


    
function getBatterDefaultEndBase(actionCode) {
    switch (actionCode) {
        case '1B': 
        case 'BB': return '1B'; 
        case 'HP': return '1B'; 
        case 'E' : return '1B';
        case '2B': return '2B';
        case '3B': return '3B';
        case 'HR': return 'H'; 
        case 'K': return 'out';
        case 'GO':
        case 'FO':
        case 'LO':
        case 'FC':
        case 'SF': return 'out';
        case 'SH': return 'out';
        default: return 'stay'; 
    }
}


    /**
     * Logique interne d'avancement du batteur et des manches, sans mise à jour du DOM.
     * @param {number} newOuts - Nombre d'outs générés par l'action.
     * @param {boolean} isLoading - Vrai si appelé depuis loadMatchHistory.
     */
    function internalAdvanceGame(newOuts = 0, isLoading = false) {
        currentOuts += newOuts;
        const currentRosterOrder = parseInt(batterSelect.value, 10);
        let nextRosterOrder = currentRosterOrder + 1;
        
        const activeRoster = currentBattingTeamRoster.filter(entry => entry.roster_order !== 0 && entry.roster_order !== null);
        const maxOrder = activeRoster.reduce((max, entry) => Math.max(max, entry.roster_order), 0);
        
        if (currentOuts < 3) {
            if (nextRosterOrder > maxOrder) {
                nextRosterOrder = 1;
            }
            // FIX: Assurer que la valeur est une chaîne pour le sélecteur
            //batterSelect.value = String(nextRosterOrder);
            
        } else {
            // Changement de demi-manche
            currentOuts = 0;
            if (!isLoading) {
                baseState = { '1B': null, '2B': null, '3B': null }; 
            }
            
            if (!isTopInning) {
                currentInning++; 
            }
            isTopInning = !isTopInning; 
            
            // FIX: Assurer que la valeur est une chaîne
            batterSelect.value = '1'; 
        }
        
        currentBattingTeamRoster = isTopInning ? awayRoster : homeRoster;
    }