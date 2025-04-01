const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.db');

// Middleware
app.use(express.json());


// Création et connexion à la base de données
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite');
        initializeDatabase();
    }
});

// Fonction pour initialiser la base de données
function initializeDatabase() {
    db.serialize(() => {
        // Table utilisateurs
        db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
            id_utilisateur INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            telephone TEXT,
            mot_de_passe TEXT NOT NULL,
            type_utilisateur TEXT NOT NULL CHECK(type_utilisateur IN ('client', 'commerçant')),
            adresse TEXT
        );`);

        // Table commerces
        db.run(`CREATE TABLE IF NOT EXISTS commerces (
            id_commerce INTEGER PRIMARY KEY AUTOINCREMENT,
            nom_commerce TEXT NOT NULL,
            adresse_commerce TEXT NOT NULL,
            siret TEXT NOT NULL UNIQUE,
            ouverture TIME NOT NULL,
            fermeture TIME NOT NULL,
            ouvert_weekend BOOLEAN NOT NULL DEFAULT 0,
            ouverture_weekend TIME,
            fermeture_weekend TIME,
            id_utilisateur INTEGER NOT NULL,
            avis_moyenne REAL DEFAULT 0,
            FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur)
        );`);

        // Table client_payment
        db.run(`CREATE TABLE IF NOT EXISTS client_payment (
            id_client_payment INTEGER PRIMARY KEY AUTOINCREMENT,
            titulaire_carte TEXT NOT NULL,
            numero_carte_client TEXT NOT NULL,
            date_expiration TEXT NOT NULL,
            cvv TEXT NOT NULL,
            carte_type TEXT NOT NULL,
            id_utilisateur INTEGER NOT NULL,
            FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur)
        );`);

        // Table commerce_payment
        db.run(`CREATE TABLE IF NOT EXISTS commerce_payment (
            id_commerce_payment INTEGER PRIMARY KEY AUTOINCREMENT,
            IBAN_commerce TEXT NOT NULL,
            BIC_SWIFT TEXT NOT NULL,
            titulaire_compte TEXT NOT NULL,
            nom_banque TEXT NOT NULL,
            devise TEXT NOT NULL DEFAULT 'EUR',
            id_commerce INTEGER NOT NULL,
            FOREIGN KEY (id_commerce) REFERENCES commerces(id_commerce));
        `);

        // Table offres
        db.run(`CREATE TABLE IF NOT EXISTS offres (
            id_offre INTEGER PRIMARY KEY AUTOINCREMENT,
            nom_offre TEXT NOT NULL,
            disponibilite INTEGER NOT NULL,
            prix_avant REAL,
            prix_apres REAL NOT NULL,
            date_expiration DATE,
            type TEXT NOT NULL,
            condition TEXT,
            description TEXT,
            id_commerce INTEGER NOT NULL,
            date_publication DATETIME DEFAULT CURRENT_TIMESTAMP,
            disponibilite_actuelle INTEGER NOT NULL,
            offre_URL TEXT,
            FOREIGN KEY (id_commerce) REFERENCES commerces(id_commerce));
        `);

        // Table commandes
        db.run(`CREATE TABLE IF NOT EXISTS commandes (
            id_commande INTEGER PRIMARY KEY AUTOINCREMENT,
            id_client INTEGER NOT NULL,
            prix_totale REAL NOT NULL,
            date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
            code_validation TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'en attente' CHECK(status IN ('en attente', 'validée', 'en cours')),
            FOREIGN KEY (id_client) REFERENCES utilisateurs(id_utilisateur));
        `);

        // Table commandes_offres
        db.run(`CREATE TABLE IF NOT EXISTS commandes_offres (
            id_commande_offre INTEGER PRIMARY KEY AUTOINCREMENT,
            id_commande INTEGER NOT NULL,
            id_offre INTEGER NOT NULL,
            quantite INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (id_commande) REFERENCES commandes(id_commande),
            FOREIGN KEY (id_offre) REFERENCES offres(id_offre));
        `);

        // Table transactions
        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id_transaction INTEGER PRIMARY KEY AUTOINCREMENT,
            id_commerce_payment INTEGER NOT NULL,
            montant REAL NOT NULL,
            id_client_payment INTEGER NOT NULL,
            date_transaction DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_client_payment) REFERENCES client_payment(id_client_payment),
            FOREIGN KEY (id_commerce_payment) REFERENCES commerce_payment(id_commerce_payment));
        `);

        // Table avis
        db.run(`CREATE TABLE IF NOT EXISTS avis (
            id_avis INTEGER PRIMARY KEY AUTOINCREMENT,
            id_commerce INTEGER NOT NULL,
            id_client INTEGER NOT NULL,
            note INTEGER NOT NULL CHECK(note BETWEEN 1 AND 5),
            commentaire TEXT,
            date_avis DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_commerce) REFERENCES commerces(id_commerce),
            FOREIGN KEY (id_client) REFERENCES utilisateurs(id_utilisateur));
        `);

        // NOUVELLE TABLE: contact
        db.run(`CREATE TABLE IF NOT EXISTS contact (
            id_contact INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP);
        `);
        db.on('trace', console.log);
        console.log('Toutes les tables ont été créées avec succès');
    });
}

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

// Gestion de la fermeture propre
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Erreur lors de la fermeture de la base de données:', err.message);
        } else {
            console.log('Connexion à la base de données fermée');
        }
        process.exit(0);
    });
});