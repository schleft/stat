const playByPlayLog = document.getElementById('playByPlayLog');

/**
 * Reconstruit l'état du jeu et affiche l'historique à partir des plays sauvegardés.
 * @param {Array<Object>} plays - La liste des actions de jeu (`match_plays`).
 */
function loadMatchHistory(plays) {
    if (!plays || plays.length === 0) {
        return;
    }
    
    // 1. Réinitialisation complète de l'état
    currentInning = 1;
    isTopInning = true; 

    // Permet de distinguer les changements de manche
    currentInningSAV = 0;
    isTopInningSAV = true;

    currentOuts = 0;
    baseState = { '1B': null, '2B': null, '3B': null };

    batterSelect.value = '1'; 
    
    currentBattingTeamRoster = awayRoster; 
    playByPlayLog.innerHTML = ''; 

    // 2. Boucle CHRONOLOGIQUE pour reconstruire l'état
    plays.forEach(play => {
        const tempLogEntry = document.createElement('div');
        tempLogEntry.classList.add('log-entry');
        
        let tempBatterName = (play.batter && play.batter.name) ? play.batter.name : 'N/A';
        if (['N/A'].includes(tempBatterName) && ['SB', 'CS', 'WP', 'PB'].includes(play.action)) {
             tempBatterName = 'Coureur(s)';
        }
        const tempInning = play.inning || 'N/A';
        const tempIsTop = play.isTop;
        const tempTopBottom = tempIsTop === true ? 'Top' : (tempIsTop === false ? 'Bottom' : 'N/A');
        const tempAction = play.action || 'Action N/A';

        // --- Ecriture du play

        //On vérifie un éventuel changement de demi manche :
        if (currentInningSAV != currentInning || isTopInningSAV != isTopInning) {
            const inningLogEntry = document.createElement('div');
            inningLogEntry.classList.add('log-entry');
            inningLogEntry.classList.add('bold');
            inningLogEntry.innerHTML = `Inning ${tempInning} - ${tempTopBottom}`;

            inningLogEntry.dataset.inning = currentInning;        // équivaut à data-inning="1"
            inningLogEntry.dataset.topBottom = `${tempTopBottom}`;  // ou "bottom"
            playByPlayLog.append(inningLogEntry); 
            currentInningSAV = currentInning;
            isTopInningSAV = isTopInning;
        }

        tempSummary = displayLog(`${tempBatterName}`, `${tempAction}`, `${play.defensiveCode}`, `${play.runsScored}`, `${play.outsGenerated}`);

        // --- Étape A: Mise à jour du baseState (reconstruction de l'état FINAL du play)
        let newBaseState = { '1B': null, '2B': null, '3B': null };
        play.movements.forEach(movement => {
            const endBase = movement.end;
            
            if (['1B', '2B', '3B'].includes(endBase)) {
                // Les roster_order sont stockés en DB, on les réutilise
                newBaseState[endBase] = String(movement.player_roster_order); 
            }
        });
        baseState = newBaseState;

        // --- Étape B: Mettre à jour l'état du jeu (manche/demi-manche/outs)
        if (play.inning !== currentInning || play.isTop !== isTopInning) {
            currentInning = play.inning;
            isTopInning = play.isTop;
            currentOuts = 0; 
        }
        currentOuts = play.initialOuts; // Rétablir les outs AVANT le play

        // --- Étape C: Positionner le batteur (Pour le play en cours de log)


        currentBattingTeamRoster = play.isTop ? awayRoster : homeRoster;
        
        // --- Étape D: Avancer l'état du jeu (outs, inning, batteur pour le play SUIVANT)
        internalAdvanceGame(play.outsGenerated, true); 

        tempLogEntry.dataset.inning = currentInning;        // équivaut à data-inning="1"
        tempLogEntry.dataset.topBottom = `${tempTopBottom}`;  // ou "bottom"
        tempLogEntry.innerHTML = tempSummary;
        playByPlayLog.append(tempLogEntry); 
    });
}

/**
 * Rajoute un log dans le playByPlay.
 */
function logAction(data) {
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    
    // Utilisation d'un accès sécurisé pour les données et fallbacks
    let batterName = (data.batter && data.batter.name) ? data.batter.name : 'N/A';
    
    //let tempBatterName = (play.batter && play.batter.name) ? play.batter.name : 'N/A';
    // Cas spécifique des actions de coureur sans batteur
    if (['N/A'].includes(batterName) && ['SB', 'CS', 'WP', 'PB'].includes(data.action)) {
         batterName = 'Coureur(s)';
    }

    // TODO : On doit gérér l'affichage de la séparation de chaque demi-manche

    const inning = data.inning || 'N/A';
    const isTop = data.isTop;
    const topBottom = isTop === true ? 'Top' : (isTop === false ? 'Bottom' : 'N/A');
    const action = data.action || 'Action N/A';

    // --- Ecriture du play


    //On vérifie un éventuel changement de demi manche :
    if (inning != document.getElementById('playByPlayLog').lastElementChild.dataset.inning 
        || topBottom != document.getElementById('playByPlayLog').lastElementChild.dataset.topBottom) {
        const inningLogEntry = document.createElement('div');
        inningLogEntry.classList.add('log-entry');
        inningLogEntry.classList.add('bold');
        inningLogEntry.innerHTML = `Inning ${inning} - ${topBottom}`;
        playByPlayLog.append(inningLogEntry); 
    }

    logEntry.dataset.inning = `${inning}`;        // équivaut à data-inning="1"
    logEntry.dataset.topBottom = `${topBottom}`;  // ou "bottom"

    logEntry.innerHTML = displayLog(`${batterName}`, `${action}`, `${data.defensiveCode}`, `${data.runsScored}`, `${data.outsGenerated}`);

    // Utiliser appendChild pour ajouter au bas (ordre chronologique souhaité)
    playByPlayLog.appendChild(logEntry); 

    // On ajoute le play, sinon on calcul mal le prochaine batter, et d'autres choses
    matchPlays[matchPlays.length] = data;
}

function displayLog(batterName, action, defensiveCode, runScored, outsGenerated) {
    var logLine = "";


    // On écrits l'action du bateur et/ou du/des coureur(s)
    log = batterName+"  : **"+action+"**";

    if (defensiveCode) {
        log += "("+defensiveCode+")";
    }

    if (runScored > 0) {
        log += ", **"+runScored+" Pt(s)** marqué(s)";
    }

    if (outsGenerated > 0) {
        log += ", "+outsGenerated+" Out";  
        if (outsGenerated > 1) {
            log += `s`;
        }  
    }


    return log;
}