// Fonction pour basculer entre les onglets
"use strict"

function switchToTab(tabId) {
    const tab = new bootstrap.Tab(document.getElementById(tabId));
    tab.show();
}


    // Validation du formulaire
document.getElementById('paymentForm').addEventListener('submit', function(evnt) {
    e.preventDefault();
    // Ici vous ajouteriez la logique pour enregistrer la carte
    alert('Carte enregistrée avec succès!');
    switchToTab('saved-cards-tab');
    // Rafraîchir la liste des cartes ici
});





// Fonction pour charger une carte dans le formulaire de modification
function loadCardForEdit(cardId, cardName, cardType, cardNumber, cardExpiry, cardCvv) {
    // Remplir le formulaire
    document.getElementById('editCardId').value = cardId;
    document.getElementById('editCardName').value = cardName;
    document.getElementById('editCardNumber').value = cardNumber.replace(/(\d{4})(?=\d)/g, "•••• ");
    document.getElementById('editCardExpiry').value = cardExpiry;
    document.getElementById('editCardCvv').value = cardCvv;
    
    // Sélectionner le type de carte
    const typeSelect = document.getElementById('editCardType');
    for (let i = 0; i < typeSelect.options.length; i++) {
        if (typeSelect.options[i].text === cardType) {
            typeSelect.selectedIndex = i;
            break;
        }
    }
    
    // Afficher l'onglet de modification
    document.getElementById('edit-card-tab').style.display = 'block';
    switchToTab('edit-card-tab');
}