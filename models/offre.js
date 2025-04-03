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


class offre{
    static async addNewOffre({id_commerce, nom_offre, type, prix_avant, prix_apres, date_expiration, 
        disponibilite, description, condition, statut, imageURL}){
            return new Promise((resolve, reject) =>{
                const requete = `
                INSERT INTO offres (id_commerce, nom_offre, type, prix_avant, prix_apres, date_expiration, 
                disponibilite, description, condition, statut, offre_URL, disponibilite_actuelle)
                VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)
                `;

                db.run(requete, [1, nom_offre, type, prix_avant, prix_apres, date_expiration, 
                    disponibilite, description, condition, statut, imageURL, disponibilite], function(err) {
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
module.exports = offre;