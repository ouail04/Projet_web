const utilisateur = require('../models/Utilisateur')
const commerce = require('../models/Commerce')
const CommercePayment =  require('../models/CommercePayment')
const anonymeController = require('./anonymeController');


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
    try {
        const { nom, prenom, email, telephone, mot_de_passe, confirmation_mot_de_passe, type_utilisateur, adresse } = req.body;
        if (mot_de_passe !== confirmation_mot_de_passe) {
            return res.render('register', { error: "Les mots de passe ne correspondent pas !" });
        }

        const userId = await utilisateur.create({ nom, prenom, email, telephone, mot_de_passe, type_utilisateur, adresse });
        req.session.user = { id_utilisateur: userId, type_utilisateur };

        if (type_utilisateur === "client") {
            return res.redirect('/');
        } else {
            return res.redirect('/commerce-register');
        }
    } catch (err) {
        console.error("Create account error " + err);
        return res.redirect('/register');
    }
};



exports.deconnexion = async (req, res) =>{
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Erreur lors de la suppression de la session.");
        }
        res.redirect('/login');
    });
}


exports.addNewCommerce = async (req, res) =>{
    try{
        if (!req.session.user || !req.session.user.id_utilisateur) {
           console.log("no session");
        }
        const {nom_commerce,adresse_commerce,siret,ouverture,fermeture,ouvert_weekend,ouverture_weekend,fermeture_weekend} = req.body ;
        const id_utilisateur = req.session.user?.id_utilisateur;
        const commerceId = await commerce.addNewCommerceNoWeekend({id_utilisateur, nom_commerce,adresse_commerce,siret,ouverture,fermeture});
        req.session.user.id_commerce = commerceId ; 
        return res.redirect('/commerce-payment-register');
    } catch (err){
        console.error(err);
        return res.redirect('/commerce-register');
    }
}


exports.addNewInfoPayemntCommerce = async (req, res) => {
    try{
        if (!req.session.user || !req.session.user.id_utilisateur || !req.session.user.id_commerce) {
            console.log("no session");
            return res.redirect('/commerce-payment-register');
        }

        const {IBAN_commerce, BIC_SWIFT, titulaire_compte, nom_banque,devise} = req.body ;
        const id_commerce = req.session.user?.id_commerce;
        const id_commerce_payment = await CommercePayment.addNewInfoPayment({IBAN_commerce, BIC_SWIFT, titulaire_compte, nom_banque,devise,id_commerce}) ;
        req.session.user.id_commerce_payment = id_commerce_payment ;
        return res.redirect('/commercant');
    } catch(err){
        console.log("errro mess : " + err) ;
        return res.redirect('/commerce-payment-register') ;
    }
}

exports.login = async (req, res) => {
    try{
        const {email, mot_de_passe} = req.body ;
        console.log(mot_de_passe);
        const {id_utilisateur , type_utilisateur} = await utilisateur.getIDUtilisateur({email, mot_de_passe}) ;
        if(id_utilisateur){
            req.session.user = { id_utilisateur, type_utilisateur };
            if(type_utilisateur === "client"){
                return res.redirect('/') ;
            } else{
                return res.redirect('/commercant');
            }
        }else{
            console.log("id : " + id_utilisateur);
            return res.redirect('/login');
        }
    } catch(err){
        console.log("erreur message : " + err);
        return res.redirect('/login');
    }
    
}
