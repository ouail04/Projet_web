const utilisateur = require('../models/Utilisateur')
const commerce = require('../models/Commerce')
const CommercePayment =  require('../models/CommercePayment')
const anonymeController = require('./anonymeController');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
// ce fichier contient les fonctions pour gérer l'authentification et l'inscription des utilisateurs

// cette fonction affiche la page d'inscription
exports.showRegisterPage = async (req, res) => {
    res.render('partials/register',
        {
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        }
    );
};

// cette fonction afficher la page d'inscription de commerce si l'utilisateur est un commercant
exports.showCommerceRegisterPage = async (req, res) => {
    res.render('commercant/commerce-register',{
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    });
};


// cette fonction affiche ma page pour enregistrer les informations de paiement du commerce
exports.showCommercePaymentRegisterPage = async (req, res) => {
    res.render('commercant/commerce-payment-register');
};


// cette fonction affiche la page de connexion
exports.showLoginPage = async (req, res) => {
    res.render('partials/login',{
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    }
    );
};

// cette fontion permet de créer un compte utilisateur apres la validation du formulaire d'inscription
exports.createAccount = async (req, res) => {
    try {
        const { nom, prenom, email, telephone, mot_de_passe, confirmation_mot_de_passe, type_utilisateur, adresse } = req.body;
        if (mot_de_passe !== confirmation_mot_de_passe) {
            req.flash('error', 'Les mots de passe ne correspondent pas !');
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
        req.flash('error', 'Ce email est déjà utilisé !');
        console.error("Create account error " + err);
        return res.redirect('/register');
    }
};


// cette fonction permet de se deconnecter de l'application
// elle supprime la session de l'utilisateur et le redirige vers la page de connexion
exports.deconnexion = async (req, res) =>{
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Erreur lors de la suppression de la session.");
        }
        res.redirect('/login');
    });
}

// fonction pour ajouter un commerce lors de l'inscription
exports.addNewCommerce = async (req, res) =>{
    try{
        if (!req.session.user || !req.session.user.id_utilisateur) {
           console.log("no session");
        }
        const {nom_commerce,adresse_commerce,siret,ouverture,fermeture,ouvert_weekend,ouverture_weekend,fermeture_weekend} = req.body ;
        const id_utilisateur = req.session.user?.id_utilisateur;
        const commerceId = await commerce.addNewCommerceNoWeekend({id_utilisateur, nom_commerce,adresse_commerce,siret,ouverture,fermeture});
        req.session.user.id_commerce = commerceId ; 
        req.flash('success', 'Commerce ajouté avec succès !');
        return res.redirect('/commerce-payment-register');
    } catch (err){
        req.flash('error', 'SIRET déjà utilisé !');
        console.error(err);
        return res.redirect('/commerce-register');
    }
}

// cette fontion permet d'ajouter les informations de paiement du commerce
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


// cette fonction permet de se connecter à l'application
// si l'utilisateur est un client, il ajoute un id de session et le redirige vers la page d'accueil
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
            req.flash('error', 'Email ou mot de passe incorrect');
            return res.redirect('/login');
        }
    } catch(err){
        req.flash('error', 'Email ou mot de passe incorrect');
        console.log("erreur message : " + err);
        return res.redirect('/login');
    }
    
}


// cette fonction permet de supprimer le compte d'utilisateur 
// si l'utilisateur à supprimer son compte, tous les informations de son compte seront supprimées de la base de données
// à l'aide de ON DELETE CASCADE dans la base de données
exports.deleteAccount = async (req, res) => {
    try {
        // 1. Vérification de session
        if (!req.session.user) {
            return res.redirect('/');
        }

        // 2. Extraction du mot de passe
        const { mot_de_passe } = req.body; // Destructuration correcte
        const id = req.session.user.id_utilisateur;

        // 3. Validation du mot de passe
        if (!mot_de_passe || typeof mot_de_passe !== 'string') {
            req.flash('error', 'Mot de passe invalide');
            return redirectBack(req, res);
        }

        // 4. Récupération de l'utilisateur
        const user = await utilisateur.getutilisateurByID(id);
        if (!user) {
            req.flash('error', 'Utilisateur non trouvé');
            return res.redirect('/');
        }

        // 5. Comparaison sécurisée
        const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        
        if (!isMatch) {
            req.flash('error', 'Mot de passe incorrect');
            return redirectBack(req, res);
        }

        // 6. Suppression et déconnexion
        await utilisateur.deleteUtilisateur(id);
        return res.redirect('/logout');

    } catch (error) {
        console.error('Erreur suppression compte:', error);
        req.flash('error', 'Erreur lors de la suppression');
        return redirectBack(req, res);
    }
};

// Helper pour rediriger vers la page précédente
function redirectBack(req, res) {
    return req.session.user.type_utilisateur === 'client' 
        ? res.redirect('/profil') 
        : res.redirect('/commercant-profil');
}



// modifier mot de passe client
exports.getForgotPasswordPage = (req, res) => {
    res.render('partials/forgot-password', { message: null });
};

// Envoie le lien par mail pour modifier le mot de passe
exports.sendResetLink = async (req, res) => {
    const { email } = req.body;
    const user = await utilisateur.findEmail(email); // À adapter

    if (user.count === 0) {
        return res.render('auth/forgot-password', { message: "Aucun utilisateur trouvé." });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000); // expire dans 1h
    console.log("expiresAt : " + expiresAt);
    await utilisateur.saveResetToken(email, token, expiresAt);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ouaizouina02@gmail.com',
            pass: 'ovpktjbjxiqvkvfc'
        },
        tls: {
            rejectUnauthorized: false // 👈 Ignore le certificat auto-signé
        }
    });

    const resetUrl = `http://localhost:3000/reset-password/${token}`; // À adapter selon votre route
    await transporter.sendMail({
        from: 'noreply@gaspillage.com',
        to: email,
        subject: 'Réinitialisation de mot de passe',
        html: `<p>Cliquez <a href="${resetUrl}">ici</a> pour réinitialiser votre mot de passe.</p>`
    });

    res.render('partials/forgot-password', { message: "Email envoyé avec succès." });
};



// Affiche le formulaire de nouveau mot de passe
exports.getResetPasswordPage = async (req, res) => {
    const token = req.params.token;
    res.render('partials/reset-password', { token });
};


// Modifie le mot de passe
exports.postResetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await utilisateur.findByResetToken(token);
    const dateNow = new Date();
    const expiresAt = new Date(user.reset_token_expires); // Assurez-vous que cette propriété existe dans votre modèle
    console.log("dateNow : " + dateNow);
    console.log("expiresAt : " + expiresAt);
    console.log("user : " + user);
    console.log("compare : " + (new Date(user.reset_token_expires) < new Date(dateNow.toISOString())));
    if (!user || new Date(user.reset_token_expires) < new Date(dateNow.toISOString())) {
        return res.render('partials/reset-password', { token, message: "Lien expiré ou invalide." });
    }

    await utilisateur.updatePasswordByEmail(user.email, newPassword);
    await utilisateur.clearResetToken(user.email);
    req.flash('success', 'Mot de passe modifié avec succès.');
    return res.redirect('/login'); // Redirige vers la page de connexion
};


