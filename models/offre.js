const { rejects } = require('assert');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        db.run("PRAGMA foreign_keys = ON;", (err) => {
            if (err) {
                console.error('Erreur lors de l’activation des clés étrangères:', err.message);
            } else {
                console.log('Clés étrangères activées avec succès');
            }
        });
        console.log('Connecté à la base de données SQLite Commerce');
    }
});


class offre{

    // cette methode permet d'ajouter une nouvelle offre
    static async addNewOffre({id_commerce, nom_offre, type, prix_avant, prix_apres, date_expiration, 
            disponibilite, description, condition, statut, imageURL}){
            return new Promise((resolve, reject) =>{
                const requete = `
                INSERT INTO offres (id_commerce, nom_offre, type, prix_avant, prix_apres, date_expiration, 
                disponibilite, description, condition, statut, offre_URL, disponibilite_actuelle)
                VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)
                `;

                db.run(requete, [id_commerce, nom_offre, type, prix_avant, prix_apres, date_expiration, 
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
    // cette methode permet de recuperer toutes les offres d'un commercant avec id_commerce
    static async getOffresByID(id_commerce){
        return new Promise((resolve, reject) =>{
            const requete = "SELECT * FROM offres WHERE id_commerce = ?" ;
            db.all(requete, [id_commerce], async (err, rows) =>{
                if(err){
                    console.error("Erreur SQL :", err.message);
                    return reject(err); 
                }
                if (!rows){
                    console.log("aucun offre trouvée") ;
                    return reject(new Error("aucun offre trouvée"));
                }
                return resolve(rows) ;
                
                
            });
        } );
    }
    // cette methode permet de recuperer une offre avec id_offre
    static async getOffreByIdOffre(id_offre){
        return new Promise((resolve, reject) =>{
            const requete = "SELECT * FROM offres WHERE id_offre = ?" ;
            db.get(requete, [id_offre], async (err, rows) =>{
                if(err){
                    console.error("Erreur SQL :", err.message);
                    return reject(err); 
                }
                if (!rows){
                    console.log("aucun offre trouvée") ;
                    return reject(new Error("aucun offre trouvée"));
                }
                return resolve(rows) ;
            
            });
        });
    }
    // cette methode permet de faire la mise à jour d'une offre avec id_offre
    static async updateOffer({id_offre, nom_offre, type, prix_avant, prix_apres, date_expiration, 
        disponibilite, description, condition, statut, imageURL}) {
        return new Promise((resolve, reject) => {
            const requete = imageURL 
                ? `UPDATE offres SET 
                    nom_offre = ?, type = ?, prix_avant = ?, prix_apres = ?, 
                    date_expiration = ?, disponibilite = ?, disponibilite_actuelle = ?, 
                    description = ?, condition = ?, statut = ?, offre_URL = ? 
                    WHERE id_offre = ?`
                : `UPDATE offres SET 
                    nom_offre = ?, type = ?, prix_avant = ?, prix_apres = ?, 
                    date_expiration = ?, disponibilite = ?, disponibilite_actuelle = ?, 
                    description = ?, condition = ?, statut = ? 
                    WHERE id_offre = ?`;
    
            const parametres = imageURL
                ? [nom_offre, type, prix_avant, prix_apres, date_expiration,
                   disponibilite, disponibilite, description, condition, statut, 
                   imageURL, id_offre]
                : [nom_offre, type, prix_avant, prix_apres, date_expiration,
                   disponibilite, disponibilite, description, condition, statut, 
                   id_offre];
    
            db.run(requete, parametres, function(err) {
                if (err) return reject(new Error(`Erreur SQL: ${err.message}`));
                if (this.changes === 0) return reject(new Error("Aucune offre trouvée"));
                
                console.log(`Mise à jour réussie. Changements: ${this.changes}`);
                resolve(true);
            });
        });
    }



    // cette methode permet de recuperer l'url de l'image d'une offre avec id_offre
    static async getImageUrl(id_offre) {
            return new Promise((resolve, reject) => {
                const requete = "SELECT offre_URL  FROM offres WHERE id_offre = ?";
        
                db.get(requete, [id_offre], async (err, row) => {
                    if (err) {
                        console.error("Erreur SQL :", err.message);
                        return reject(err);  // Rejeter en cas d'erreur SQL
                    }
        
                    if (!row) {
                        console.log("Utilisateur non trouvé");
                        return reject(new Error("Utilisateur non trouvé"));  // Rejeter si l'utilisateur n'existe pas
                    }
                    return resolve({offre_URL : row.offre_URL});
                });
            });
        }

    // cette methode permet de supprimer une offre avec id_offre
    static async deleteOffre(id_offre) {
        return new Promise((resolve, reject) => {
            const requete = "DELETE FROM offres WHERE id_offre = ?";
    
            db.run(requete, [id_offre], function(err) {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  // Rejeter en cas d'erreur SQL
                }
    
                if (this.changes === 0) {
                    console.log("Aucune offre trouvée");
                    return reject(new Error("Aucune offre trouvée"));  // Rejeter si aucune offre n'a été supprimée
                }
    
                console.log(`Offre supprimée avec succès. Changements: ${this.changes}`);
                resolve(true);  // Résoudre la promesse si la suppression a réussi
            });
        });
    }


    // cette methode permet de faire la mise à jour du status d'une offre avec id_offre
    static async setStatus(id_offre, statut) {
        return new Promise((resolve, reject) => {
            const requete = "UPDATE offres SET statut = ? WHERE id_offre = ?";
    
            db.run(requete, [statut, id_offre], function(err) {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err); 
                }
    
                if (this.changes === 0) {
                    console.log("aucune offre trouvee");
                    return reject(new Error("aucune offre trouvee"));  
                }
    
                console.log("statut mis à jour avec succès. Changements: ${this.changes}");
                return resolve("statut modifier");  
            });
        });
    }

    // cette methode permet de recuperer toutes les offres avec nom_offre, type, statut
    static async searchOffer(nom_offre, type, sort_by, statut) {
        return new Promise((resolve, reject) => {
            let requete = "SELECT * FROM offres WHERE statut = 'active' AND nom_offre LIKE ? " ;
            let params = [`%${nom_offre}%`];
            if (type != "all") {
                requete += "AND type = ? ";
                params.push(type);
            }
            if (statut != "all") {
                requete += "AND statut = ? ";
                params.push(statut);
            }

            if(sort_by === "recent"){
                requete += "ORDER BY date_publication DESC" ;
            }else {
                requete += "ORDER BY date_publication" ;
            }
            console.log(requete) ;
            console.log(params) ;
            db.all(requete, params, (err, rows) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
                if (rows.length === 0) {
                    console.log("Aucune offre trouvée");
                    return resolve([]);  
                }
                return resolve(rows);  
            });
        });
    }



    // cette methode permet de recuperer toutes les offres avec nom_offre, type avec id_commerce
    static async searchOfferByIdCommerce(id_commerce,nom_offre, type, sort_by, statut) {
        return new Promise((resolve, reject) => {
            let requete = "SELECT * FROM offres WHERE nom_offre LIKE ? AND id_commerce = ? " ;
            let params = [`%${nom_offre}%`, id_commerce];
            if (type != "all") {
                requete += "AND type = ? ";
                params.push(type);
            }
            if (statut != "all") {
                requete += "AND statut = ? ";
                params.push(statut);
            }
            if(sort_by === "recent"){
                requete += "ORDER BY date_publication DESC" ;
            }else {
                requete += "ORDER BY date_publication" ;
            }
            console.log(requete) ;
            console.log(params) ;
            db.all(requete, params, (err, rows) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
                if (rows.length === 0) {
                    console.log("Aucune offre trouvée");
                    return resolve([]);  
                }
                return resolve(rows);  
            });
        });
    }


    // cette methode permet de recuperer toutes les offres avec nom_offre, type, statut avec limit
    static async searchOfferClient(nom_offre, type ,sorted_experation, sorted_prix, ville, limit = 6) {
        return new Promise((resolve, reject) => {
            let requete = "SELECT * FROM offres NATURAL JOIN commerces WHERE offres.nom_offre LIKE ? AND offres.statut = 'active' AND commerces.adresse_commerce LIKE ? " ;
            let params = [`%${nom_offre}%`, `%${ville}%`];
            if (type != "all") {
                requete += "AND offres.type = ? ";
                params.push(type);
            }
            if(sorted_prix != 'all' && sorted_experation == 'all'){
                sorted_prix == 'haut' ? requete += "ORDER BY offres.prix_apres DESC" : requete += "ORDER BY offres.prix_apres" ;
            } else {
                if (sorted_experation != 'all' && sorted_prix == 'all') {
                    sorted_experation === 'haut' ? requete += "ORDER BY offres.date_expiration DESC" : requete += "ORDER BY offres.date_expiration";
                } else {
                    if (sorted_experation != 'all' && sorted_prix != 'all') {
                        sorted_prix === 'haut' ? requete += "ORDER BY offres.prix_apres DESC, " : requete += "ORDER BY offres.prix_apres, ";
                        sorted_experation === 'haut' ? requete += "offres.date_expiration DESC" : requete += "offres.date_expiration";
                    }
                }
            }
            if(limit != 0){
                requete += " LIMIT ?" ;
                params.push(limit) ;
            }

            console.log(requete) ;
            console.log(params) ;
            db.all(requete, params, (err, rows) => {
                if (err) {
                    console.error("err SQL :", err.message);
                    return reject(err);  
                }
                if (rows.length === 0) {
                    console.log("aucune offre trouvee");
                    return resolve([]);  
                }
                return resolve(rows);  
            });
        });
    }

    // cette methode permet de recuperer un offre avec id_offre
    static async getOffreByID(id_offre) {
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM offres NATURALE JOIN commerces WHERE id_offre = ?";
    
            db.get(requete, [id_offre], (err, row) => {
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


    

    // cette methode permet de recuperer le prix d'une offre avec id_offre
    static async getPrix(id_offre) {
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM offres WHERE id_offre = ?";
    
            db.get(requete, [id_offre], (err, row) => {
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
    
    // cette methode permet de faire la mise à jour de la disponibilite d'une offre avec id_offre
    static async updateDiponibilite(nouvelle_dispo, id_offre){
        return new Promise((resolve, reject) => {
            const requete = "UPDATE offres SET disponibilite_actuelle = ? WHERE id_offre = ?"
            db.run(requete, [nouvelle_dispo, id_offre], function(err) {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err); 
                }

                if (this.changes === 0) {
                    console.log("aucune offre trouvee");
                    return reject(new Error("aucune offre trouvee"));  
                }

                console.log("disponibilite mis à jour avec succès. Changements: ${this.changes}");
                return resolve("disponibilite modifier");  
        });
    });
    }
}

module.exports = offre;