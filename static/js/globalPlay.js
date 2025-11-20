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
        case 'K':
            return 'K';
        case 'GO':
            return '6-3'; // SS vers 1B (exemple de ground out courant)
        case 'FO':
        case 'SF':
            return 'F8'; // Fly Out/Sac Fly vers CF (exemple de fly out courant)
        case 'LO':
            return 'L6'; // Line Out vers SS (exemple de line out courant)
        case 'SH':
            return '1-4'; // Sacrifice Bunt (P vers 2B)
        case 'FC':
            return 'FC (6-4)'; // Fielder's Choice (SS vers 2B)
        case 'E':
            return 'E?'; // Erreur - doit être remplacé par le joueur (E3, E6, etc.)
        case '1B':
        case '2B':
        case '3B':
        case 'HR':
            return 'X'; // Hit - Code position/zone (Souvent marqué 'X' ou zone)
        case 'BB':
            return 'BB';
        case 'HP':
            return 'HP';
        case 'SB':
            return 'SB';
        case 'CS':
            return 'CS (2-6)'; // Tentative d'out par C vers SS
        case 'WP':
            return 'WP';
        case 'PB':
            return 'PB';
        default:
            return '';
    }
}


    
function getBatterDefaultEndBase(actionCode) {
    switch (actionCode) {
        case '1B': 
        case 'BB': 
        case 'HP': 
        case 'E' : return '1B';
        case '2B': return '2B';
        case '3B': return '3B';
        case 'HR': return 'H'; 
        case 'K':
        case 'GO':
        case 'FO':
        case 'LO':
        case 'FC':
        case 'SF':
        case 'SH': return 'out';
        default: return 'stay'; 
    }
}