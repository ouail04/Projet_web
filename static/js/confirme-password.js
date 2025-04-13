 "use strict";
 // Validation du formulaire:
        
 document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Vérification de la correspondance des mots de passe
    if (password !== confirmPassword) {
        alert("❌ Les mots de passe ne correspondent pas !");
        return;
    }

    // Vérification de la sécurité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        alert("❌ Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
        return;
    }

    // Si tout est OK, soumettre le formulaire
    this.submit();
});