const multer = require('multer');
const path = require('path');
const fs = require('fs');

const stockage = multer.diskStorage({
    destination: (req, file, cb) => { 
        const repertoireDestination = path.join(__dirname, '../static/upload/');
        //test si le dossier existe ou pas si non, il va le crie
        if (!fs.existsSync(repertoireDestination)) {
            fs.mkdirSync(repertoireDestination, { recursive: true });
        }
        cb(null, repertoireDestination);
    },
    filename: (req, file, cb) => {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'offre-' + suffix + extension);
    }
});

const upload = multer({ 
    storage: stockage,
    limits: { 
        fileSize: 50 * 1024 * 1024, // 50MB max pour les fichiers
        fieldSize: 10 * 1024 * 1024  // 10MB max pour les champs texte
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées'), false);
        }
    }
});

function telechargerImage(image){
    try{
        return upload.single('image');
    } catch(err){
        console.log("erreur image : ", err);
        throw new Error(err) ;
    }
}


module.exports = telechargerImage('image');