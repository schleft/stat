
const radialMenu = document.getElementById('radialMenu');

// Défini la structure du menu radial
//  - Label : Libelle affiché du menu
//  - Type  : Est-ce une action ou cela ouvre un sous-menu ?
//  - Next  : Si type 'menu', indique le menu à ouvrir
//  - Code  : Code de l'action a effectuer
const MENU_ACTIONS = {

    'MAIN': {
        'HIT': { label: 'Hit'    , type: 'menu'  , next: 'HIT_DETAIL' },
        'OUT': { label: 'Out'    , type: 'menu'  , next: 'OUT_DETAIL' },
        'BB':  { label: 'BB'     , type: 'menu', next: 'BB_DETAIL' },
        'HP':  { label: 'HP'     , type: 'action', code: 'HP'        },
        'E':   { label: 'Erreur' , type: 'action', code: 'E' },
        'RUN': { label: 'Coureur', type: 'menu' , next: 'RUN_DETAIL' },
    },
        'HIT_DETAIL': {
            '1B': { label: 'Simple'  , type: 'action', code: '1B' },
            '2B': { label: 'Double'  , type: 'action', code: '2B' },
            '3B': { label: 'Triple'  , type: 'action', code: '3B' },
            'HR': { label: 'Home Run', type: 'action', code: 'HR' },
        },
        'OUT_DETAIL': {
            'K':  { label: 'Strikeout' , type: 'menu'  , next: 'STK_DETAIL' },
            'GO': { label: 'Ground Out', type: 'action', code: 'GO' },
            'FO': { label: 'Fly Out'   , type: 'action', code: 'FO' },
            'LO': { label: 'Line Out ' , type: 'action', code: 'LO' },
            'SF': { label: 'Sacrifice' , type: 'menu'  , next: 'SAC_DETAIL' },
        },
            'STK_DETAIL': {
                'KS':  { label: 'Swinging' , type: 'action', code: 'KS' },
                'KL':  { label: 'Looking'  , type: 'action', code: 'KL' },
            },
            'SAC_DETAIL': {
                'F':  { label: 'Fly' , type: 'action', code: 'SF' },
                'H':  { label: 'Hit' , type: 'action', code: 'SH' },
            },
        'BB_DETAIL': {
            'BB':  { label: 'BB'  , type: 'action', code: 'BB' },
            'IBB': { label: 'IBB' , type: 'action', code: 'IBB' },
        },
        'RUN_DETAIL': {
            'SB': { label: 'But Volé (SB)'      , type: 'action', code: 'SB' },
            'WP': { label: 'Mauvais Lancer (WP)', type: 'action', code: 'WP' },
            'PB': { label: 'Balle Passée (PB)'  , type: 'action', code: 'PB' },
            'CS': { label: 'Coureur Retiré (CS)', type: 'action', code: 'CS' },
        }
};

// État du menu radial
let currentMenuLevel = 'MAIN';
const menuHistory = []; 


// Affiche le menu radial
function openRadialMenu() {
    const selectedOption = batterSelect.options[batterSelect.selectedIndex];
    
    // On vérifie qu'un batteur est sélectionné
    if (!selectedOption || selectedOption.disabled || !selectedOption.dataset.rosterOrder) { 
        alert("Veuillez sélectionner un batteur valide (ligne non vide).");
        return;
    }

    pendingActionData = {
        batter: {
            rosterOrder: selectedOption.value,
            name: selectedOption.dataset.playerName,
            teamId: parseInt(selectedOption.dataset.teamId, 10)
        }
    };
    
    menuHistory.length = 0; 
    displayRadialMenu('MAIN');
}


// Cache le menu radial
function closeRadialMenu() {
    radialMenu.classList.remove('active');
    currentMenuLevel = 'MAIN';
    menuHistory.length = 0;
}


// Sélectionne le menu à afficher
function displayRadialMenu(levelId) {
    const currentActions = MENU_ACTIONS[levelId];
    radialMenu.innerHTML = ''; 

    // 1. Bouton Fermer/Retour
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-menu-btn';
    closeBtn.textContent = (levelId === 'MAIN') ? 'X' : '◀️ ';
    closeBtn.dataset.action = (levelId === 'MAIN') ? 'CLOSE' : 'BACK';
    radialMenu.appendChild(closeBtn);
    
    // 2. Boutons d'action
    const items = [];
    for (const key in currentActions) {
        const action = currentActions[key];
        
        // FILTRAGE CORRIGÉ: Masquer 'Coureur' si aucune base n'est occupée
        if ((levelId === 'MAIN' && key === 'RUN') || (levelId === 'RUN_DETAIL')) {
            const hasRunners = hasRunnersOnBase();
            if (!hasRunners) {
                continue; 
            }
            if (levelId === 'RUN_DETAIL' && action.code === 'CS' && !hasRunners) {
                continue; 
            }
        }

        const item = document.createElement('div');
        item.classList.add('menu-item');
        item.textContent = action.label;
        item.dataset.actionCode = action.code || key; 
        item.dataset.actionType = action.type;
        item.dataset.nextLevel = action.next;
        radialMenu.appendChild(item);
        items.push(item);
    }

    //Gestion du positionnement en fonction du nombre de menu
    const menu = document.querySelector('.radial-menu');
    //const items = menu.querySelectorAll('.menu-item');
    const radius = 100; // rayon du cercle

    const total = items.length;

    items.forEach((item, i) => {
        const angle = (360 / total) * i; // angle pour chaque item
        item.style.transform = `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`;
    });
    
    currentMenuLevel = levelId;
    radialMenu.classList.add('active');
}


// Utilisé pour la navigation dans le menu radial
radialMenu.addEventListener('click', function(event) {
    const target = event.target.closest('[data-action],[data-action-type]');
    if (!target) return;

    const actionType = target.dataset.actionType;
    const actionCode = target.dataset.actionCode;
    const nextLevel = target.dataset.nextLevel;
    const explicitAction = target.dataset.action;
    
    if (explicitAction === 'CLOSE') {
        closeRadialMenu();
        return;
    }

    if (explicitAction === 'BACK') {
        menuHistory.pop();
        const prevLevel = menuHistory.length > 0 ? menuHistory[menuHistory.length - 1] : 'MAIN';
        displayRadialMenu(prevLevel);
        return;
    }

    if (actionType === 'menu' && nextLevel) {
        menuHistory.push(currentMenuLevel); 
        displayRadialMenu(nextLevel);       
        return;
    }

    if (actionType === 'action' && actionCode) {
        closeRadialMenu();
        openActionDetailModal(actionCode);
        return;
    }
});

closeMenuBtn.addEventListener('click', closeRadialMenu);