const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite Commerce');
        db.run("PRAGMA foreign_keys = ON;", (err) => {
            if (err) {
                console.error('Erreur lors de l’activation des clés étrangères:', err.message);
            } else {
                console.log('Clés étrangères activées avec succès');
            }
        });
    }
});

class Commerce{

    // cette methode permet d'ajouter un nouveau commerce 
    // explication : Le mot NOWEEKEND est utilisé pour crier un commerce sans l'ouverture le week-end dans la conception de qu'était prevue mais apres on a decidé de ne pas l'utiliser
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
    
    // cette methode permet de faire la mise à jour d'un commerce
    static async updateCommerce(id_utilisateur, nom_commerce, adresse_commerce, ouverture, fermeture) {
        return new Promise((resolve, reject) => {
            const requete = `
                UPDATE commerces 
                SET nom_commerce = ?, 
                    adresse_commerce = ?, 
                    ouverture = ?, 
                    fermeture = ? 
                WHERE id_utilisateur = ?
            `;
            
            db.run(
                requete, 
                [nom_commerce, adresse_commerce, ouverture, fermeture, id_utilisateur], 
                function(err) {
                    if (err) {
                        console.error('Erreur SQL:', err.message);
                        reject(new Error('Échec de la mise à jour du commerce'));
                    } else {
                        resolve({
                            changes: this.changes,
                            message: this.changes > 0 
                                ? 'Commerce mis à jour avec succès' 
                                : 'Aucun commerce trouvé avec cet ID'
                        });
                    }
                }
            );
        });
    }

    // cette methode permet de recuperer les informations d'un commerce avec id_utilisateur
    static async getCommerceInfo(id_utilisateur){
        return new Promise((resolve, reject) =>{
            const requete = "SELECT * FROM commerces WHERE id_utilisateur = ?";
    
            db.get(requete, [id_utilisateur], (err, row) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
    
                if (!row) {
                    console.log("Aucune offre trouvée");
                    return resolve(null); 
                }
    
                return resolve(row);  
            });
        } );
        
    }
    
}

module.exports = Commerce;