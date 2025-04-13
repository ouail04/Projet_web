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

class Commande_Offre{
    static async addCommande_Offre(id_commande, id_offre, quantite){
        return new Promise((resolve, reject) => {
            const requete = "INSERT INTO commandes_offres (id_commande, id_offre, quantite) VALUES (?, ?, ?)";
            db.run(requete, [id_commande, id_offre, quantite], function(err) {
                if (err) {
                    console.error("Erreur lors de l'ajout de la commande offre:", err.message);
                    reject(err);
                } else {
                    resolve(this.lastID); // Renvoie l'ID de la dernière ligne insérée
                }
            });
        });
    }

    static async getCommande_OffreByID(id_commande_offre) {
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM commandes_offres WHERE id_commande_offre = ?";
            db.get(requete, [id_commande_offre], (err, row) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
                if (!row) {
                    console.log("Aucune commande offre trouvée");
                    return reject(new Error("Aucune commande offre trouvée"));  
                }
                return resolve(row);  
            });
        });
    }


    static async deleteOfferPanier(id_offre) {
        return new Promise((resolve, reject) => {
            const requete = "DELETE FROM commandes_offres WHERE id_commande_offre = ?";
            db.run(requete, [id_offre], function(err) {
                if (err) {
                    console.error("Erreur lors de la suppression de l'offre du panier:", err.message);
                    return reject(err);  
                }
                resolve(this.changes); // Renvoie le nombre de lignes supprimées
            });
        });
    }

    static async getCommande_OffreByIDCommande(id_commande) {
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM commandes_offres WHERE id_commande = ?";
            db.all(requete, [id_commande], (err, rows) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
                if (!rows || rows.length === 0) {
                    console.log("Aucune commande offre trouvée");
                    return reject(new Error("Aucune commande offre trouvée"));  
                }
                return resolve(rows);  
            });
        });
    }

}
module.exports = Commande_Offre;


