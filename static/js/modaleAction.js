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
    
    let defaultOuts = 0;
    if (['K', 'GO', 'FO', 'LO', 'FC', 'CS', 'SF', 'SH'].includes(actionCode)) {
         defaultOuts = 1;
    }
    document.getElementById('outsGenerated').value = defaultOuts.toString();
    
    // CORRECTION: Pré-remplissage du code défensif
    const defaultDefensiveCode = getDefaultDefensiveCode(actionCode);
    document.getElementById('defensiveCodeModal').value = defaultDefensiveCode;


    populateRunnerActions(batterName, batterRosterOrder, actionCode, batterTeamId);

    actionDetailModal.style.display = 'block';
}