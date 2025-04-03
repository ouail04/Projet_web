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
    limits: { fileSize: 50 * 1024 * 1024 }, // 50mb la limite  
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées'), false);
        }
    }
});

module.exports = upload.single('image');