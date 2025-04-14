const bcrypt = require('bcrypt');
const { promises } = require('dns');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite Utilisateur');
        db.run("PRAGMA foreign_keys = ON;", (err) => {
            if (err) {
                console.error('Erreur lors de l’activation des clés étrangères:', err.message);
            } else {
                console.log('Clés étrangères activées avec succès');
            }
        });
    }
});


class utilisateur{

    // cette methode permet d'ajouter un nouvel utilisateur
    static async create({nom, prenom, email, telephone, mot_de_passe, type_utilisateur, adresse}) {
        try{
            if (!mot_de_passe || typeof mot_de_passe !== 'string') {
                throw new Error("Mot de passe invalide");
            }
            const mot_de_passe_hasher = await bcrypt.hash(mot_de_passe,10);
            return new Promise((resolve, reject) => {
                const requete = 
                'INSERT INTO utilisateurs(nom, prenom, email, telephone, mot_de_passe, type_utilisateur, adresse)' 
                +'VALUES(?,?,?,?,?,?,?)' ;
                db.run(requete, [nom, prenom, email, telephone, mot_de_passe_hasher, type_utilisateur, adresse],
                    function(err){
                        if (err){
                            reject(err);
                        } else{
                            resolve(this.lastID);
                        }
                    }
                );
            });
        } catch (err){
            console.log("SQL ERROR : " + err.message);
            throw new Error('erreur lors du hachage du mot de passe : ' + err.message);
        }        
    }

    // cette methode permet de recuperer un utilisateur avec son email et son mot de passe
    static async getIDUtilisateur({ email, mot_de_passe }) {
        return new Promise((resolve, reject) => {
            const requete = "SELECT id_utilisateur, mot_de_passe, type_utilisateur FROM utilisateurs WHERE email = ?";
    
            db.get(requete, [email], async (err, row) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  // Rejeter en cas d'erreur SQL
                }
    
                if (!row) {
                    console.log("Utilisateur non trouvé");
                    return reject(new Error("Utilisateur non trouvé"));  // Rejeter si l'utilisateur n'existe pas
                }
    
                try {
                    // Comparer le mot de passe en clair avec le mot de passe haché
                    const isEgaux = await bcrypt.compare(mot_de_passe, row.mot_de_passe);
                    
                    if (isEgaux) {
                        return resolve({id_utilisateur : row.id_utilisateur, type_utilisateur: row.type_utilisateur});  // Résoudre avec l'id_utilisateur si les mots de passe correspondent
                    } else {
                        return reject(new Error("Mot de passe incorrect"));  // Rejeter si les mots de passe ne correspondent pas
                    }
                } catch (error) {
                    console.log("Erreur lors de la comparaison des mots de passe :", error.message);
                    return reject(new Error("Erreur lors de la comparaison des mots de passe"));
                }
            });
        });
    }
    // cette methode permet de recuperer un utilisateur avec son id_utilisateur
    static async getutilisateurByID(id_utilisateur){
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM utilisateurs WHERE id_utilisateur = ?";
    
            db.get(requete, [id_utilisateur], async (err, row) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  // Rejeter en cas d'erreur SQL
                }
    
                if (!row) {
                    console.log("Utilisateur non trouvé");
                    return reject(new Error("Utilisateur non trouvé"));  // Rejeter si l'utilisateur n'existe pas
                }

                return resolve(row) ;
            
            });
        });
    
    }

    // cette methode permet de faire la mise à jour d'un utilisateur avec id_utilisateur
    static async updateUtilisateur(id_utilisateur, adresse, nom, prenom, telephone, email){
        return new Promise((resolve, reject) => {
            const requete = "UPDATE utilisateurs SET adresse = ?, nom = ? , prenom = ? , telephone = ? , email = ? WHERE id_utilisateur = ?"
            db.run(requete, [adresse, nom, prenom, telephone, email, id_utilisateur], function(err){
                    if (err){
                        reject(err);
                    } else{
                        resolve(this.lastID);
                    }
            } );
        });
    }


    // cette methode permet de faire la mise à jour du mot de passe d'un utilisateur avec id_utilisateur
    static async updatePassword(id_utilisateur, newPassword){

        return new Promise(async (resolve, reject) => {
            const requete = "UPDATE utilisateurs SET mot_de_passe = ? WHERE id_utilisateur = ?"
            // Chiffrement du mot de passe avant de le stocker
            const mot_de_passe_hasher = await bcrypt.hash(newPassword,10);
            db.run(requete, [mot_de_passe_hasher, id_utilisateur], function(err){
                    if (err){
                        reject(err);
                    } else{
                        resolve(this.changes);
                    }
            } );
        });
    }

    // cette methode permet de supprimer un utilisateur avec id_utilisateur
    static async deleteUtilisateur(id_utilisateur){
        return new Promise(async (resolve, reject) => {
            const requete = "DELETE FROM utilisateurs WHERE id_utilisateur = ?"
            db.run(requete, [id_utilisateur], function(err){
                    if (err){
                        reject(err);
                    } else{
                        resolve(this.changes);
                    }
            } );
        });
    }

    // cette methode permet de recuperer un utilisateur avec son email
    static async findEmail(email) {
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM utilisateurs WHERE email = ?";
            
            db.get(requete, [email], (err, row) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);
                }
    
                if (!row) {
                    // Aucun utilisateur trouvé
                    return resolve({ count: 0, user: null });
                }
    
                // Utilisateur trouvé
                return resolve({ count: 1, user: row });
            });
        });
    }

    // cette methode permet de recuperer un utilisateur avec son email
    static async updatePasswordByEmail(email, newPassword){

        return new Promise(async (resolve, reject) => {
            const requete = "UPDATE utilisateurs SET mot_de_passe = ? WHERE email = ?"
            // Chiffrement du mot de passe avant de le stocker
            const mot_de_passe_hasher = await bcrypt.hash(newPassword,10);
            db.run(requete, [mot_de_passe_hasher, email], function(err){
                    if (err){
                        reject(err);
                    } else{
                        resolve(this.changes);
                    }
            } );
        });
    }

    // cette methode permet de inserer un token de reinitialisation de mot de passe
    static async saveResetToken(email, token, expiresAt) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE utilisateurs SET reset_token = ?, reset_token_expires = ? WHERE email = ?`;
            const expireToString = expiresAt.toISOString(); // Convertir expiresAt en chaîne ISO 8601
            console.log("expiresAt : " + expireToString);
            db.run(sql, [token, expireToString, email], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
    
    // cette methode permet de recuperer un utilisateur avec son token de reinitialisation de mot de passe
    static async findByResetToken(token) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM utilisateurs WHERE reset_token = ?`;
            db.get(sql, [token], function (err, row) {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // cette methode permet reinitialiser le token et le temps d'expiration à null apres la reinitialisation du mot de passe    
    static async clearResetToken(email) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE utilisateurs SET reset_token = NULL, reset_token_expires = NULL WHERE email = ?`;
            db.run(sql, [email], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
    
    
    
}

module.exports = utilisateur;