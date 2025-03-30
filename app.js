const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const clientController = require('./controllers/clientController');
const anonymeController = require('./controllers/anonymeController');
const commercantController = require('./controllers/commercantController')

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Pointe vers le dossier views
// Middleware pour fichiers statiques (IMPORTANT)
app.use('/static', express.static(path.join(__dirname, 'static'))); // Pointe vers le dossier static
app.use(express.urlencoded({ extended: true })); // Middleware







// Route anonyme user
app.get('/', anonymeController.showHomePage);
app.get('/offres', anonymeController.showOffersPage);
app.get('/comment-ca-marche', anonymeController.showHowItWorksSection); // Utilisation du routeur pour la page "Comment ça marche ?"

// Route client user
app.get('/profil', clientController.showProfilPage);
app.get('/commandes', clientController.showCommandesPage); 

// Route commercant user
app.get('/commercant', commercantController.showCommercantIndexPage);

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});