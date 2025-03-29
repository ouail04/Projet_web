const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Pointe vers le dossier views
// Middleware pour fichiers statiques (IMPORTANT)
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true })); // Middleware
// Route
app.get('/', (req, res) => {
    res.render('anonyme/index', { titre: 'Accueil' });
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});