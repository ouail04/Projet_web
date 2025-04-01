const utilisateur = require('../models/Utilisateur')


exports.showRegisterPage = async (req, res) => {
    res.render('partials/register');
};


exports.showCommerceRegisterPage = async (req, res) => {
    res.render('commercant/commerce-register');
};

exports.showCommercePaymentRegisterPage = async (req, res) => {
    res.render('commercant/commerce-payment-register');
};

exports.showLoginPage = async (req, res) => {
    res.render('partials/login');
};

// fonctions 
exports.createAccount = async (req, res) => {
    try{
        const { nom, prenom, email, telephone, mot_de_passe, confirmation_mot_de_passe, type_utilisateur, adresse } = req.body;
        if (mot_de_passe==confirmation_mot_de_passe){
            const userId = await utilisateur.create({ nom, prenom, email, telephone, mot_de_passe, type_utilisateur, adresse });
            res.session.user = {id_utilisateur : userId, type_utilisateur:type_utilisateur};
            if (type_utilisateur == "Client"){
                res.render('/');
            } else{
                res.render('commercant/commerce-register')
            }
        } else{
            res.render('/register');
        }
    } catch(err){
        res.render('/register');
    }
};
