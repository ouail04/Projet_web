const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const ejs = require('ejs');
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
app.use(express.urlencoded({limit:'10mb', extended: true })); // pour les formulaire htmls
const flash = require('connect-flash');
app.use(flash());




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
app.get('/commerce-register', registerController.showCommerceRegisterPage);
app.get('/commerce-payment-register', registerController.showCommercePaymentRegisterPage);

//Route login
app.get('/login', registerController.showLoginPage);



//fonctionnalite
app.post('/create-account', registerController.createAccount);
app.get('/logout', registerController.deconnexion) ;
app.post('/add-new-commerce', registerController.addNewCommerce);
app.post('/add-new-info-payment', registerController.addNewInfoPayemntCommerce);
app.post('/login-form', registerController.login) ;
app.post('/add-offer', commercantController.addOffer);
app.post('/edit-offre', commercantController.editOffer);
app.post('/delete-offre', commercantController.deleteOffer);
app.post('/set-status', commercantController.setStatus);
app.get('/search-offer', commercantController.searchOffer);
app.get('/search-offer-client', clientController.searchOfferClient);
app.get('/add-to-panier', clientController.addToPanier);
app.get('/details-offre/:id', clientController.showDetailsOffer);
app.get('/delete-offre-panier/:id', clientController.deleteOfferPanier);
app.get('/payment/:id', clientController.showPaymentPage);
app.post('/process-payment', clientController.processPayment);
app.get('/search-commande-client', clientController.searchCommandeClient);
app.post('/valider-commande', commercantController.validerCommande);
app.post('/update-profil', clientController.updateProfil);
app.post('/update-password', clientController.updatePasword) ;
app.post('/add-card-payment', clientController.addCartePayment) ;
app.get('/delete-card-payment/:id', clientController.deleteCartePaiement);
app.post('/update-commercant-profil', commercantController.updateCommercantProfil);
app.post('/update-commerce-payment', commercantController.updateCommercePaiement)
app.post('/delete-account', registerController.deleteAccount);
app.get('/payment/', clientController.showPaymentPage);


// modifier mot de passe client
app.get('/forgot-password', registerController.getForgotPasswordPage);
app.post('/forgot-password', registerController.sendResetLink);
app.get('/reset-password/:token', registerController.getResetPasswordPage);
app.post('/reset-password/:token', registerController.postResetPassword);






app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});