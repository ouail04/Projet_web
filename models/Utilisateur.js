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
    }
});


class utilisateur{
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
}
module.exports = utilisateur;