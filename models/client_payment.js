const sqlite3 = require('sqlite3').verbose();
const { encrypt_data, decrypt_data } = require('../controllers/security')
const path = require('path');
const DB_PATH = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite Commerce');
    }
});

class client_payment {
    static async getClientPaymentByID(id_utilisateur) {
        return new Promise((resolve, reject) => {
            const requete = "SELECT * FROM client_payment WHERE id_utilisateur = ?";
            db.all(requete, [id_utilisateur], (err, row) => {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
                if (!row) {
                    console.log("Aucun paiement trouvé");
                    return reject(new Error("Aucun paiement trouvé"));  
                }
                return resolve(row);  
            });
        });
    }


    static async addClientPayment(numero_carte, date_expiration, cvv, titulaire_carte,type_carte ,id_client) {
        return new Promise((resolve, reject) => {
            // Chiffrement des données avant de les stocker
            numero_carte = encrypt_data(numero_carte);
            const requete = "INSERT INTO client_payment (numero_carte_client, date_expiration, cvv, titulaire_carte, carte_type, id_utilisateur) VALUES (?, ?, ?, ?, ?, ?)";
            db.run(requete, [numero_carte, date_expiration, cvv, titulaire_carte, type_carte , id_client], function(err) {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
                return resolve(this.lastID);  
            });
        });
    }

    static async deleteCartePaiement(id_client_payment){
        return new Promise((resolve, reject) => {
            const requete = "DELETE FROM client_payment WHERE id_client_payment = ?";
            db.run(requete, [id_client_payment], function(err) {
                if (err) {
                    console.error("Erreur SQL :", err.message);
                    return reject(err);  
                }
                return resolve(this.changes);  
            });
        });
    }

    



}

module.exports = client_payment;