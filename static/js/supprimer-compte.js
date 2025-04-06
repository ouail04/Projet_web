 "use strict"
 // Activation du bouton de suppression
 document.getElementById('confirmDelete').addEventListener('change', function() {
    document.getElementById('deleteAccountBtn').disabled = !this.checked;
});

// Gestion de la déconnexion
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
        window.location.href = "/logout";
    }
});

