
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Fonction améliorée pour supprimer une image
function deleteImage(imagePath) {
    return new Promise((resolve, reject) => {
        if (!imagePath) return reject(new Error('Chemin de l\'image manquant'));

        const fullPath = path.join(__dirname, '../static/upload/', path.basename(imagePath));

        fs.unlink(fullPath, (err) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.warn('Fichier déjà supprimé:', fullPath);
                    return resolve(false);
                }
                return reject(new Error(`Échec suppression image: ${err.message}`));
            }
            console.log('Image supprimée:', fullPath);
            resolve(true);
        });
    });
}


module.exports = deleteImage ;
