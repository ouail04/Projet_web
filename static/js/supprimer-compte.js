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

// Gestion de la suppression
document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    const password = document.getElementById('accountPassword').value;
    if (!password) {
        alert("Veuillez entrer votre mot de passe");
        return;
    }
    
    // Ici vous ajouteriez la requête AJAX
    console.log("Suppression du compte avec le mot de passe:", password);
    alert("Compte supprimé avec succès (simulation)");
    window.location.href = "/";
});