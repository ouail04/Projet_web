const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite');
    }
});


class utilisateur{
    static async create({nom, prenom, email, telephone, mot_de_passe, type_utilisateur, adresse}) {
        try{
            if (!mot_de_passe || typeof mot_de_passe !== 'string') {
                console.log("Mot de passe invalide");
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
            console.log(err.message);
            throw new Error('erreur lors du hachage du mot de passe : ' + err.message);
        }        
    }
}
module.exports = utilisateur;