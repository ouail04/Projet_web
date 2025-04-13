const sqlite3 = require('sqlite3').verbose();
const Utilisateur = require('./Utilisateur');

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

class Commande{
    static async addCommande(id_client, prix_total){
        return new Promise(async (resolve, reject) => {
                const sql = `INSERT INTO commandes (id_client, prix_totale, code_validation) VALUES (?, ?, ?)`;
                const code_validation = Math.floor(100000 + Math.random() * 900000); // Génération d'un code de validation aléatoire à 6 chiffres
                db.run(sql, [id_client, prix_total, code_validation], async function(err) {
                    if (err) {
                        console.error('Erreur lors de l\'ajout de la commande:', err.message);
                        reject(err);
                    } else {
                        
                        resolve(this.lastID); // Renvoie l'ID de la commande insérée
                        
                    }
                });
        });
    }

    
    static async getPanierByID(id_utilisateur) {
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM commandes_offres " +
            "INNER JOIN commandes ON commandes_offres.id_commande = commandes.id_commande " +
            "INNER JOIN offres ON commandes_offres.id_offre = offres.id_offre " +
            "WHERE commandes.id_client = ? AND commandes.status = 'en attente'";
    
            db.all(requete, [id_utilisateur], (err, row) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
    
                if (!row) {
                    console.log("Aucune offre trouvée");
                    return reject(new Error("Aucune offre trouvée"));  
                }
    
                return resolve(row);  
            });
        });
    }

    static async getIdCommandeEnAttente(id_utilisateur) {
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM commandes WHERE id_client = ? AND status = 'en attente'";
    
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
        });
    }

    static async updatePrix(id_commande, prix_totale) {
        return new Promise((resolve, reject) => {
            const requete = "UPDATE commandes SET prix_totale = ? WHERE id_commande = ?";
    
            db.run(requete, [prix_totale, id_commande], function(err) {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
    
                return resolve(this.changes);  
            });
        });
    }

    static async getCommandeByID(id_commande) {
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM commandes WHERE id_commande = ?";
    
            db.get(requete, [id_commande], (err, row) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
    
                if (!row) {
                    console.log("Aucune commande trouvée");
                    return resolve(null); 
                }
    
                return resolve(row);  
            });
        });
    }

    static async updateStatusCommande(id_commande, status) {
        return new Promise((resolve, reject) => {
            const requete = "UPDATE commandes SET status = ? WHERE id_commande = ?";
    
            db.run(requete, [status, id_commande], function(err) {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
    
                return resolve(this.changes);  
            });
        });
    }

    static async getCommandesByIDClient(id_client){
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM commandes " +
            "NATURAL JOIN commandes_offres "+
            "NATURAL JOIN offres " +
            "WHERE commandes.id_client = ?";
    
            db.all(requete, [id_client], (err, rows) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
    
                if (!rows) {
                    console.log("Aucune offre trouvée");
                    return resolve(null); 
                }
    
                return resolve(rows);  
            });
        });
    }


    static async searchCommandesClient(id_client, nom_offre, status, date_commande){
        return new Promise((resolve, reject) => {
            let requete = "SELECT * FROM commandes " +
            "NATURAL JOIN commandes_offres "+
            "NATURAL JOIN offres " +
            "INNER JOIN utilisateurs ON commandes.id_client = utilisateurs.id_utilisateur "+
            "WHERE commandes.id_client = ? AND offres.nom_offre LIKE ?";
            let params = [id_client, `%${nom_offre}%`] ;
            if (status != 'default'){
                requete += ' AND commandes.status = ?'
                params.push(status) ;
            }
            date_commande == 'recent' ? requete += ' ORDER BY commandes.date_commande DESC' : requete += ' ORDER BY commandes.date_commande';
            console.log(requete) ;
            console.log(params) ;

    
            db.all(requete, params, (err, rows) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
    
                if (!rows) {
                    console.log("Aucune offre trouvée");
                    return resolve(null); 
                }
    
                return resolve(rows);  
            });
        });
    }


    static async searchCommandesCommerce(id_commerce, nom_offre, status, date_commande){
        return new Promise((resolve, reject) => {
            let requete = "SELECT * FROM commandes " +
            "NATURAL JOIN commandes_offres "+
            "NATURAL JOIN offres " +
            "INNER JOIN utilisateurs ON commandes.id_client = utilisateurs.id_utilisateur "+
            "WHERE offres.id_commerce = ? AND offres.nom_offre LIKE ?";
            let params = [id_commerce, `%${nom_offre}%`] ;
            if (status != 'default'){
                requete += ' AND commandes.status = ?'
                params.push(status) ;
            }
            date_commande == 'recent' ? requete += ' ORDER BY commandes.date_commande DESC' : requete += ' ORDER BY commandes.date_commande';
            console.log(requete) ;
            console.log(params) ;

    
            db.all(requete, params, (err, rows) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
    
                if (!rows) {
                    console.log("Aucune offre trouvée");
                    return resolve(null); 
                }
    
                return resolve(rows);  
            });
        });
    }
}

module.exports = Commande;