const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;
const clientController = require('./controllers/clientController');
const anonymeController = require('./controllers/anonymeController');
const commercantController = require('./controllers/commercantController')
const registerController = require('./controllers/registerController')

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Pointe vers le dossier views
// Middleware pour fichiers statiques (IMPORTANT)
app.use('/static', express.static(path.join(__dirname, 'static'))); // Pointe vers le dossier static
app.use(express.urlencoded({ extended: true })); // Middleware


app.use(session({
    secret: '123456ABCDEF', // Une clé secrète pour signer les sessions
    resave: false,          // Ne pas sauver la session si elle n'a pas été modifiée
    saveUninitialized: true, // Sauvegarder la session même si elle n'a pas été modifiée
    cookie: { secure: false } 
}));




// Route anonyme user
app.get('/', anonymeController.showHomePage);
app.get('/offres', anonymeController.showOffersPage);
app.get('/comment-ca-marche', anonymeController.showHowItWorksSection); // Utilisation du routeur pour la page "Comment ça marche ?"

// Route client user
app.get('/profil', clientController.showProfilPage);
app.get('/commandes', clientController.showCommandesPage); 

// Route commercant user
app.get('/commercant', commercantController.showCommercantIndexPage);
app.get('/mes-offres', commercantController.showCommercantOffres);
app.get('/commercant-commandes', commercantController.showCommercantCommandes);
app.get('/commercant-profil', commercantController.showCommercantProfil);

//Route register
app.get('/register', registerController.showRegisterPage);
app.post('/commerce-register', registerController.showCommerceRegisterPage);
app.post('/commerce-payment-register', registerController.showCommercePaymentRegisterPage);

//Route login
app.get('/login', registerController.showLoginPage);



//fonctionnalite
app.get('/create-account', registerController.createAccount);

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});