

function openActionDetailModal(actionCode) {
    const selectedOption = batterSelect.options[batterSelect.selectedIndex];
    
    const isRunnerOnlyAction = ['SB', 'CS', 'WP', 'PB'].includes(actionCode);
    
    if (isRunnerOnlyAction && !hasRunnersOnBase()) {
        alert("Impossible de saisir cette action s'il n'y a aucun coureur sur base.");
        closeRadialMenu(); 
        return;
    }

    const batterName = isRunnerOnlyAction ? 'N/A' : selectedOption.dataset.playerName;
    const batterRosterOrder = isRunnerOnlyAction ? null : selectedOption.value;
    const batterTeamId = isRunnerOnlyAction ? (isTopInning ? AWAY_TEAM_ID : HOME_TEAM_ID) : parseInt(selectedOption.dataset.teamId, 10);

    pendingActionData = {
        inning: currentInning,
        isTop: isTopInning,
        batter: { 
            id: batterRosterOrder, 
            name: batterName,
            rosterOrder: batterRosterOrder,
            teamId: batterTeamId
        },
        action: actionCode,
        initialBaseState: {...baseState}, 
        initialOuts: currentOuts, 
        movements: [], 
        defensiveCode: '',
        outsGenerated: 0,
        runsScored: 0
    };

    document.getElementById('modalActionCode').textContent = actionCode;
    document.getElementById('modalBatterName').textContent = batterName;
    
    let defaultOuts = getDefaultOutAction(actionCode);
    document.getElementById('outsGenerated').value = defaultOuts.toString();
    
    // CORRECTION: Pré-remplissage du code défensif
    const defaultDefensiveCode = getDefaultDefensiveCode(actionCode);
    document.getElementById('defensiveCodeModal').value = defaultDefensiveCode;


    populateRunnerActions(batterName, batterRosterOrder, actionCode, batterTeamId);

    actionDetailModal.style.display = 'block';
}

function populateRunnerActions(batterName, batterRosterOrder, actionCode, teamId) {
    const container = document.getElementById('runnerActionsContainer');
    container.innerHTML = '';
    
    const batterDefaultEndBase = getBatterDefaultEndBase(actionCode);
    const isRunnerOnlyAction = ['SB', 'CS', 'WP', 'PB'].includes(actionCode);
    
    // Map des bases pour générer les options et vérifier l'ordre
    const baseIndexMap = { 'BATTER': 0, '1B': 1, '2B': 2, '3B': 3 };


    const createRunnerRow = (baseId, runnerName, runnerRosterOrder, teamId, isBatter) => {
        const row = document.createElement('div');
        row.classList.add('runner-row');
        row.dataset.runnerRosterOrder = runnerRosterOrder;
        row.dataset.startBase = baseId;
        row.dataset.teamId = teamId;
        
        const currentBaseIndex = baseIndexMap[baseId];

        const nameDiv = document.createElement('div');
        nameDiv.classList.add('runner-info');
        nameDiv.textContent = `${baseId === 'BATTER' ? 'BAT' : baseId} : ${runnerName}`;
        
        const select = document.createElement('select');
        select.classList.add('runner-action-select');
        
        let optionsHtml = '';
        
        // 1. Option 'Stay' (Reste sur la base actuelle)
        optionsHtml += `<option value="stay">Reste à ${isBatter ? 'BAT' : baseId}</option>`;
        
        // 2. Options d'avancement (uniquement vers l'avant)
        for (const base of ['1B', '2B', '3B']) {
            const baseIndex = baseIndexMap[base];
            
            // Le batteur peut aller à 1B, 2B, 3B (index > 0)
            // Un coureur sur base ne peut aller qu'aux bases dont l'index est STRICTEMENT supérieur.
            if (isBatter && baseIndex > 0) {
                 optionsHtml += `<option value="${base}">Avance à ${base}</option>`;
            } else if (!isBatter && baseIndex > currentBaseIndex) {
                 optionsHtml += `<option value="${base}">Avance à ${base}</option>`;
            }
        }
        
        // 3. Option 'Home' (Marque)
        optionsHtml += `<option value="H">Marque (Point)</option>`;

        // 4. Option 'Out'
        optionsHtml += `<option value="out">Éliminé (Out)</option>`;
        
        select.innerHTML = optionsHtml;
        
        
        // --- Logique de sélection par défaut (Avancement forcé ou action coureur) ---
        let defaultEndBase = 'stay';

        if (isBatter) {
             defaultEndBase = batterDefaultEndBase; // Ex: '1B', '2B', 'out'
        } else if (isRunnerOnlyAction) {
            // Logique spécifique aux actions de coureurs
            if (actionCode === 'SB') {
                if (baseId === '1B') defaultEndBase = '2B';
                else if (baseId === '2B') defaultEndBase = '3B';
                else if (baseId === '3B') defaultEndBase = 'H';
            } else if (actionCode === 'CS') {
                defaultEndBase = 'out';
            } else if (actionCode === 'WP' || actionCode === 'PB') {
                // Les coureurs avancent d'une base par défaut, s'ils ne sont pas forcés
                if (baseId === '1B' || baseId === '2B') defaultEndBase = baseIndexMap[baseId] === 1 ? '2B' : '3B';
                else if (baseId === '3B') defaultEndBase = 'H';
            }
        } else {
             // Logique d'avancement forcé pour les coureurs sur base
             defaultEndBase = calculateForcedAdvance(baseId, actionCode);
        }
        
        // Application de la valeur par défaut
        if (defaultEndBase === 'out') {
            select.value = 'out';
        } else if (defaultEndBase === 'H') {
            select.value = 'H';
        } else if (['1B', '2B', '3B'].includes(defaultEndBase)) {
             select.value = defaultEndBase;
        } else { 
             // Si c'est 'stay', 'stay' est la valeur par défaut
             select.value = 'stay';
        }

        row.appendChild(nameDiv);
        row.appendChild(select);
        container.appendChild(row);
    };
    
    if (!isRunnerOnlyAction) {
        createRunnerRow('BATTER', batterName, batterRosterOrder, teamId, true);
    } else {
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `<strong>(Action de coureur : Pas d'action au bâton)</strong>`;
        container.appendChild(infoDiv);
    }
    
    Object.keys(baseState).forEach(baseId => {
        const runnerRosterOrder = baseState[baseId];
        if (runnerRosterOrder) {
            const runnerName = getRunnerName(runnerRosterOrder, teamId);
            createRunnerRow(baseId, runnerName, runnerRosterOrder, teamId, false);
        }
    });
    
    updateBaseStateSelector();
}


    
function updateBaseStateSelector() {
    const selector = document.getElementById('baseStateSelector');
    selector.innerHTML = '';
    
    const teamId = isTopInning ? AWAY_TEAM_ID : HOME_TEAM_ID;
    
    ['1B', '2B', '3B',  ].forEach(baseId => {
        const runnerRosterOrder = baseState[baseId];
        const item = document.createElement('div');
        item.classList.add('base-state-item');
        
        let runnerName = 'VIDE';
        if (runnerRosterOrder) {
            runnerName = getRunnerName(runnerRosterOrder, teamId); 
            item.classList.add('occupied');
        }
        
        item.innerHTML = `
            <div class="base-icon">${baseId}</div>
            <div class="base-runner-name">${runnerName}</div>
        `;
        selector.appendChild(item);
    });
}

async function submitActionDetail() {
    const defensiveCode = document.getElementById('defensiveCodeModal').value.trim();
    
    if (defensiveCode === '') {
        alert("Le champ 'Code Défensif / Erreur / Zone de frappe' est obligatoire pour enregistrer l'action.");
        return; 
    }
    
    const outsGenerated = parseInt(document.getElementById('outsGenerated').value, 10);
    const runnerRows = document.querySelectorAll('#runnerActionsContainer .runner-row');
    
    let newBaseState = { '1B': null, '2B': null, '3B': null };
    let totalRuns = 0;
    let movements = [];
    
    // 1. Déterminer les mouvements et l'état final des bases
    runnerRows.forEach(row => {
        const startBase = row.dataset.startBase; 
        const runnerRosterOrder = row.dataset.runnerRosterOrder; 
        const endAction = row.querySelector('.runner-action-select').value;
        const isBatter = (startBase === 'BATTER');
        
        let endBase = endAction;
        let isOut = false;
        let scored = false;

        if (endAction === 'out') {
            endBase = 'Out';
            isOut = true;
        } else if (endAction === 'H') {
            endBase = 'H';
            scored = true;
        } else if (endAction === 'stay') {
             // 'stay' signifie que le coureur reste sur sa base de départ
             endBase = startBase;
        }
        // Si endAction est '1B', '2B', ou '3B', endBase est déjà endAction
        

        if (['1B', '2B', '3B'].includes(endBase) && !isOut) {
            newBaseState[endBase] = runnerRosterOrder;
        }
        if (scored) {
            totalRuns++;
        }

        movements.push({
            player_roster_order: parseInt(runnerRosterOrder, 10), 
            start: isBatter ? 'H' : startBase,
            end: endBase,
            scored: scored,
            out: isOut
        });
    });
    
    // 2. Finalisation des données à envoyer
    pendingActionData.defensiveCode = defensiveCode;
    pendingActionData.outsGenerated = outsGenerated; 
    pendingActionData.runsScored = totalRuns;
    pendingActionData.movements = movements;
    pendingActionData.inning = currentInning;
    
    try {
        // **NOTE IMPORTANTE :** L'appel API est laissé commenté si non fonctionnel
        const response = await fetch(`/match/${MATCH_ID}/scoreCards`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pendingActionData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erreur lors de l'enregistrement du jeu (Code: ${response.status}).`);
        }
        // Mise à jour de l'état global du jeu UNIQUEMENT après succès (simulé)
        baseState = newBaseState; 
        
        logAction(pendingActionData);
        
        advanceGame(outsGenerated, totalRuns);
        
        actionDetailModal.style.display = 'none';

    } catch (error) {
        console.error('Erreur API:', error);
        alert(`Échec de l'enregistrement de l'action : ${error.message}`);
    }
}

function calculateForcedAdvance(startBase, batterActionCode) {
    const baseIndexMap = {'1B': 1, '2B': 2, '3B': 3};
    const baseStart = baseIndexMap[startBase];
    
    if (!baseStart) return 'stay';

    let basesGained = 0;
    
    switch (batterActionCode) {
        case 'BB': 
        case 'HP':
        case '1B':
        case 'E':
            basesGained = 1;
            break;
        case '2B':
            basesGained = 2;
            break;
        case '3B':
            basesGained = 3;
            break;
        case 'HR':
        case 'H':
            basesGained = 4;
            break;
        default:
            return 'stay'; 
    }
    
    // Logique de force avancée
    if (basesGained === 1 && baseState['1B'] !== null && baseState['2B'] === null && baseStart !== 1) {
         // Si c'est seulement un avancement d'une base (BB, HP, 1B), et qu'il y a un trou devant le coureur, il n'est pas forcé
         return 'stay'; 
    }
    
    let forcedEndIndex = baseStart + basesGained;
    
    const baseReverseMap = {1: '1B', 2: '2B', 3: '3B'};
    
    if (forcedEndIndex >= 4) return 'H'; 
    
    // Si la base d'arrivée forcée est la base actuelle, cela signifie 'stay' (pas d'avancement forcé au-delà)
    if (forcedEndIndex === baseStart) return 'stay';
    
    return baseReverseMap[forcedEndIndex] || 'stay'; 
}

// ------------------------------------------------------------------
// INITIALISATION ET ÉCOUTEURS
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    
    buildRosterMap(homeRoster);
    buildRosterMap(awayRoster);
    
    // 1. Charger et reconstruire l'état à partir de l'historique
    if (typeof matchPlays !== 'undefined' && matchPlays && matchPlays.length > 0) {
        loadMatchHistory(matchPlays); 
    }
    // 2. Mettre à jour l'affichage avec l'état final reconstruit
    updateGameDisplay();

    // 3. On met à jour le score
    matchPlays.forEach(play => {
        updateScore(play.inning, play.isTop, play.runsScored);
    });
    
    document.getElementById('submitActionDetailBtn').addEventListener('click', submitActionDetail);
    document.getElementById('cancelActionDetailBtn').addEventListener('click', () => {
         actionDetailModal.style.display = 'none';
    });
    
    selectActionBtn.addEventListener('click', openRadialMenu);
    nextInningBtn.addEventListener('click', () => {
        // Force le changement de demi-manche (3 outs)
        advanceGame(3 - currentOuts); 
    });
    
});