const currentBattingTeam = document.getElementById('currentBattingTeam');
const currentDefendingTeam = document.getElementById('currentDefendingTeam'); 

/**
 * Met à jour l'affichage de l'état du jeu (Manche, Outs, Équipe au bâton, et le terrain).
 */
function updateGameDisplay(runScored = 0) {
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

    //On met a jour le score
    if(runScored > 0) {
        updateScore(`${currentInning}`, `${isTopInning}`, runScored);
    }

    if(isTopInning === true) {
        currentBattingTeamRoster = awayRoster; 
    } else {
        currentBattingTeamRoster = homeRoster;   
    }

    populateBatterSelect(matchPlays);
    updateFieldDiagram(); 
}

function updateScore(inning, topInning, runScored) {
    // Récupérer le tr et le td total
    let scoreInning = topInning ? document.getElementById('awayTeamScore') : document.getElementById('homeTeamScore');
    let scoreTotal = topInning ? document.getElementById('awayTotal')  : document.getElementById('homeTotal');

    const table = document.querySelector(".inning-score-table");
    const theadRow = table.querySelector("thead tr");
    const tbodyRows = table.querySelectorAll("tbody tr");

    // ----- 1️⃣ Ajouter la colonne dans le header -----
    let thInning = theadRow.querySelector('th[data-inning="'+inning+'"]');
    if (!thInning) {
        thInning = document.createElement("th");
        thInning.setAttribute("data-inning", inning);
        thInning.textContent = inning;

        const thTotal = theadRow.querySelector("th:last-child");
        theadRow.insertBefore(thInning, thTotal);
    }
    
    // Vérifier si la colonne pour cet inning existe déjà
    let tdInning = scoreInning.querySelector('td[data-inning="'+inning+'"]');
    if (!tdInning) {
        // Créer le td pour l'inning
        tdInning = document.createElement("td");
        tdInning.className = "inning";
        tdInning.setAttribute("data-inning", inning);
        tdInning.setAttribute("data-team", topInning ? "away" : "home");
        tdInning.textContent = "0";

        // Insérer avant le td total
        scoreInning.insertBefore(tdInning, scoreTotal);

        //On rajoute aussi la colonne dans le
    }

    // Ajouter les runs à la colonne de l'inning
    tdInning.textContent = (parseInt(tdInning.textContent) || 0) + runScored;

    // Mettre à jour le total
    scoreTotal.textContent = (parseInt(scoreTotal.textContent) || 0) + runScored;
}
