const sqlite3 = require('sqlite3').verbose();
const { encrypt_data, decrypt_data } = require('../controllers/security')
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



class Transaction{

    static async addTransaction(id_commerce_payment, id_client_payment, montant){
        return new Promise((resolve, reject) => {
            const requete = "INSERT INTO transactions (id_commerce_payment, id_client_payment, montant) VALUES (?, ?, ?)";
            db.run(requete, [id_commerce_payment, id_client_payment, montant], function(err) {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
                return resolve(this.lastID);  
            });
        });
    }
}

module.exports = Transaction;