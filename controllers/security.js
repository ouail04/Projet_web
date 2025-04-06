require("dotenv").config();
const crypto = require("crypto");

const secretKey = Buffer.from(process.env.SECRET_KEY, "hex");
const IV_LENGTH = 16; // Longueur de l'IV
console.log("Clé secrète chargée :",process.env.SECRET_KEY);


// 🔒 Fonction pour chiffrer l'IBAN
function encrypt_data(iban) {
    const iv = crypto.randomBytes(IV_LENGTH); // Génère un IV aléatoire
    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
    let encrypted = cipher.update(iban, "utf-8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`; // Stocke IV et données chiffrées
}

// 🔓 Fonction pour déchiffrer l'IBAN
function decrypt_data(encryptedIBAN) {
    const [ivHex, encryptedData] = encryptedIBAN.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
}


module.exports = {encrypt_data, decrypt_data};