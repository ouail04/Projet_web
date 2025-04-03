const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite Commerce');
    }
});

class Commerce{
    static async addNewCommerceNoWeekend({ id_utilisateur, nom_commerce, adresse_commerce, siret, ouverture, fermeture }) {
        return new Promise((resolve, reject) => { 
            const requete =
                "INSERT INTO commerces (id_utilisateur, nom_commerce, adresse_commerce, siret, ouverture, fermeture)"+
                " VALUES (?, ?, ?, ?, ?, ?)";
            
            db.run(requete, [id_utilisateur, nom_commerce, adresse_commerce, siret, ouverture, fermeture], function(err) {
                if (err) {
                    console.log("SQL ERR : " + err.message);
                    reject(err);
                } else {
                    resolve(this.lastID); 
                }
            });
        });
    }
    
}

module.exports = Commerce;