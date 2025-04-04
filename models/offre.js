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


    static async searchOffer(nom_offre, type, sort_by, statut) {
        return new Promise((resolve, reject) => {
            let requete = "SELECT * FROM offres WHERE nom_offre LIKE ? " ;
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



    static async searchOfferClient(nom_offre, type ,sorted_experation, sorted_prix, ville, limit = false) {
        return new Promise((resolve, reject) => {
            let requete = "SELECT * FROM offres NATURAL JOIN commerces WHERE offres.nom_offre LIKE ? AND commerces.adresse_commerce LIKE ? " ;
            let params = [`%${nom_offre}%`, `%${ville}%`];
            if (type != "all") {
                requete += "AND offres.type = ? ";
                params.push(type);
            }
            if(sorted_prix != 'all' && sorted_experation == 'all'){
                sorted_prix == 'haut' ? requete += "ORDER BY offres.prix_apres DESC" : requete += "ORDER BY offres.prix_apres" ;
            } else{
                if (sorted_experation != 'all' && sorted_prix == 'all'){
                    sorted_experation == 'haut' ? requete += "ORDER BY offres.date_expiration DESC" : requete += "ORDER BY offres.date_expiration" ;
                } else{
                    if(sorted_experation != 'all' && sorted_prix != 'all'){
                        sorted_prix == 'haut' ? requete += "ORDER BY offres.prix_apres DESC, " : requete += "ORDER BY offres.prix_apres, " ;  
                        sorted_experation == 'haut' ? requete += "offres.date_expiration DESC" : requete += "offres.date_expiration" ;
                    }
                }
            }
            limit != false ? requete += " LIMIT 6" : requete += "" ;

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
}

module.exports = offre;