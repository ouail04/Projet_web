const telechargerImage = require('./gestionImages');
const deleteImage = require('./delete-image')
const Offre = require('../models/offre');
const Commande = require('../models/Commande') ;
const utilisateur = require('../models/Utilisateur');
const Commerce = require('../models/Commerce');
const CommercePayment = require('../models/CommercePayment');
const { decrypt_data } = require('./security');


// Fonction pour afficher la page d'accueil du commerçant
exports.showCommercantIndexPage = async (req, res) => {
    if(!req.session.user){
        return res.redirect('/') ;
    }
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Commandes", lien : "/commercant-commandes"},
        {titre : "Profil", lien : "/commercant-profil"},
        {titre : "Contact", lien : "#contact"}];
    css_files = ["index-commercant.css"] ;

        const user = await utilisateur.getutilisateurByID(req.session.user.id_utilisateur);
        const listCommandes = await Commande.searchCommandesCommerce(req.session.user.id_utilisateur,'', 'default', 'recent'); 
        const mes_offres = await Offre.getOffresByID(req.session.user.id_utilisateur);
        console.log(mes_offres);
    res.render('commercant/index-commercant', {
        titre: 'Accueil',
        pages,
        css_files,
        user,
        listCommandes,
        mes_offres

    });
};


// cette fonction affiche la page des offres du commerçant
exports.showCommercantOffres = async (req, res) => {
    if(!req.session.user){
        return res.redirect('/') ;
    }
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Commandes", lien : "/commercant-commandes"},
        {titre : "Profil", lien : "/commercant-profil"},
        {titre : "Contact", lien : "#contact"}];
    css_files = ["mes-offres.css"] ;
    try{
        const listOffres = await Offre.getOffresByID(req.session.user.id_utilisateur) ;
        res.render('commercant/mes-offres', {
            titre: 'Mes offres',
            pages,
            css_files,
            listOffres,
            nom_offre : "",
            type : "all",
            sort_by : "all",
            statut : "all",
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });


    } catch{
        console.log("erreur lors de la recuperation des offres") ;
        return res.render('commercant/mes-offres',{
            titre: 'Mes offres',
            pages,
            css_files,
            listOffres : [],
            nom_offre : "",
            type : "all",
            sort_by : "rein",
            statut : "all"
        }) ;
    }
    
};


// cette fonction affiche la page des commandes du commerçant qui sont en cours ou validées faite par le client 
exports.showCommercantCommandes = async (req, res) => {
    if(!req.session.user){
        return res.redirect('/') ;
    }
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Mes commandes", lien : "/commercant-commandes"},
        {titre : "Profil", lien : "/commercant-profil"},
        {titre : "Contact", lien : "#contact"}];

    const listCommandesCours = await Commande.searchCommandesCommerce(req.session.user.id_utilisateur,'', 'en cours', 'recent'); 
    const listCommandesterminier = await Commande.searchCommandesCommerce(req.session.user.id_utilisateur,'', 'validée', 'recent'); 
    
    css_files = ["commandes.css"] ;


    res.render('commercant/commercant-commandes', {
        titre: 'Mes commandes',
        pages,
        css_files,
        listCommandesCours, 
        listCommandesterminier,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    });
};

// cette fonction affiche la page de profil du commerçant
exports.showCommercantProfil = async (req, res) => {
    if(!req.session.user){
        return res.redirect('/') ;
    }
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Mes commandes", lien : "/commercant-commandes"},
        {titre : "Profil", lien : "/commercant-profil"},
        {titre : "Contact", lien : "#contact"}];
    css_files = ["profil.css"] ;
    const commerce_info = await Commerce.getCommerceInfo(req.session.user.id_utilisateur);
    const user = await utilisateur.getutilisateurByID(req.session.user.id_utilisateur) ;
    // Version corrigée
    let carte_commerce = await CommercePayment.getCommercePaymentByID(commerce_info.id_commerce) ;
    if (!carte_commerce) {
        throw new Error('Aucune carte de commerce trouvée');
    }
    
    const ibanDecrypte = decrypt_data(carte_commerce.IBAN_commerce);
    const last4 = ibanDecrypte.slice(-5);

    // Création d'un nouvel objet sans écraser l'original
    const resultat = {
        ...carte_commerce,
        IBAN_masque: ibanDecrypte,
        last4: last4
    };
    console.log(resultat) ;
    res.render('commercant/commercant-profil', {
        titre: 'Profil Commerçant',
        pages,
        css_files,
        user,
        commerce_info,
        resultat,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    });
};


// cette fonction permet d'ajouter une nouvelle offre
// elle appelle la fonction telechargerImage pour gérer le téléchargement de l'image
// telechargerImage est une fonction qui telecharge l'image et la stocke dans le dossier static/upload
exports.addOffer = [
    telechargerImage, 
    async (req, res) => {
        try {
            const {nom_offre, type, prix_avant, prix_apres, date_expiration, 
                   disponibilite, description, condition, statut} = req.body;
            if (!req.file) {
                console.log('Debug - Fichier reçu:', req.file); 
                return res.redirect('/mes-offres');
            }
            
            const imageURL = '/static/upload/' + req.file.filename;
            const id_commerce = req.session.user?.id_utilisateur;
            Offre.addNewOffre({id_commerce, nom_offre, type, prix_avant, prix_apres, date_expiration, 
                disponibilite, description, condition, statut, imageURL,disponibilite  }) ;
            console.error('Offre ajouter avec succees');
            req.flash('success', 'Offre ajoutée avec succès');
            return res.redirect('/mes-offres');
        } catch (error) {
            req.flash('error', 'Une erreur est survenue lors de l\'ajout de l\'offre');
            console.log('Erreur:', error);
            return res.redirect('/mes-offres');
        }
    }
];


// cette fonction permet de modifier une offre existante
exports.editOffer = [telechargerImage, async (req, res) => {
    try {
        const {id_offre, nom_offre, type, prix_avant, prix_apres, date_expiration, 
              disponibilite, description, condition, statut} = req.body;

        let image_url = null;
        // Vérification si le commercant à telecharger une nouvelle image
        if (req.file) {
            image_url = '/static/upload/' + req.file.filename;
            console.log('Nouvelle image:', image_url);
            try {
                const image_url_delete = await Offre.getImageUrl(id_offre) ;
                // si oui on supprime l'ancienne image
                await deleteImage(image_url_delete.offre_URL);
                console.log("suppression avec succes")  ;
            } catch (error) {
                console.log("erreur de suppression : " , error) ;
                return res.redirect('/mes-offres') ;
            }
        }

        await Offre.updateOffer({
            id_offre, 
            nom_offre, 
            type, 
            prix_avant, 
            prix_apres, 
            date_expiration, 
            disponibilite, 
            description, 
            condition, 
            statut,
            imageURL: image_url
        });
        req.flash('success', 'Offre mise à jour avec succès');
        return res.redirect('/mes-offres');
    } catch(err) {
        req.flash('error', 'Une erreur est survenue lors de la mise à jour de l\'offre');
        console.error('Erreur:', err);
        return res.redirect('/mes-offres');
    }
}];

// cette fonction permet de supprimer une offre existante
exports.deleteOffer = async (req, res) => {
    try {
        const { id_offre } = req.body;
        const image_url_delete = await Offre.getImageUrl(id_offre) ;
        await deleteImage(image_url_delete.offre_URL);
        await Offre.deleteOffre(id_offre) ;
        req.flash('success', 'Offre supprimée avec succès');
        return res.redirect('/mes-offres');
    } catch(err) {
        req.flash('error', 'Une erreur est survenue lors de la suppression de l\'offre');
        console.error('Erreur:', err);
        return res.redirect('/mes-offres');
    }
};

// cette fonction permet de changer le statut d'une offre existante de 'active' à 'pause' ou vice versa
exports.setStatus = async (req, res) => {
    try {
        const { id_offre, statut } = req.body;
        await Offre.setStatus(id_offre, statut) ;
        req.flash('success', 'Statut de l\'offre mis à jour avec succès');
        return res.redirect('/mes-offres');
    } catch(err) {
        req.flash('error', 'Une erreur est survenue lors de la mise à jour du statut de l\'offre');
        console.error('Erreur:', err);
        return res.redirect('/mes-offres');
    }
}

// cette fonction permet de rechercher les offres
exports.searchOffer = async (req, res) => {
    if(!req.session.user){
        return res.redirect('/') ;
    }
    let { nom_offre, type, sort_by, statut } = req.query;
    if(nom_offre == undefined) nom_offre = " " ;
    console.log("nom_offre : ", nom_offre, " type : ", type, " sort_by : ", sort_by, " statut : ", statut) ;
    const listOffres = await Offre.searchOffer(nom_offre, type, sort_by, statut) ;
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Commandes", lien : "/commercant-commandes"},
        {titre : "Profil", lien : "/commercant-profil"},
        {titre : "Contact", lien : "#contact"}];
    css_files = ["mes-offres.css"] ;
    res.render('commercant/mes-offres', {
        titre: 'Mes offres',
        pages,
        css_files,
        listOffres, nom_offre, type, sort_by, statut
    });
}

// cette fonction permet de valider une commande en entrant le code de validation
exports.validerCommande = async (req, res) => {
    const {id_commande, code_validation} = req.body ;
    const commande = await Commande.getCommandeByID(id_commande) ;
    if (code_validation  == commande.code_validation){
        // changer le statut de la commande à 'validée'
        await Commande.updateStatusCommande(id_commande, 'validée') ;
        req.flash('success','commande valider avec succes') ;
        return res.redirect('/commercant-commandes');
    } else {
        req.flash('error','commande non valider code validation incorrect ');
        return res.redirect('/commercant-commandes') ;
    }
}

// cette fonction permet de changer les informations sur le commerce de commercant 
// la fonction qui fait la mise à jour des informations de commercant et son mot de passe c'est la meme que de client 
exports.updateCommercantProfil = async (req, res) => {
    try {
        
        const { nom_commerce, adresse_commerce, ouverture, fermeture } = req.body;
        
        if (!nom_commerce || !adresse_commerce) {
            req.flash('error', 'Le nom et l\'adresse du commerce sont obligatoires');
            return res.redirect('/commercant-profil');
        }
        const result = await Commerce.updateCommerce(
            req.session.user.id_utilisateur, // Utilisation de l'ID utilisateur dynamique
            nom_commerce, 
            adresse_commerce, 
            ouverture, 
            fermeture
        );

        // 4. Gestion du retour
        if (result.changes > 0) {
            req.flash('success', 'Profil mis à jour avec succès');
        } else {
            req.flash('error', 'Une erreur est survenue lors de la mise à jour');
        }

        return res.redirect('/commercant-profil');

    } catch (err) {
        console.error("Erreur lors de la mise à jour du commerce:", err);
        
        // Journalisation plus détaillée en production
        if (process.env.NODE_ENV === 'production') {
            logger.error('Update commerce failed - User: id_utilisateur , err');
        }

        console.log('error', 'Une erreur est survenue lors de la mise à jour');
        return res.redirect('/commercant-profil');
    }
};

// cette fonction permet de changer les informations de paiement du commercant
exports.updateCommercePaiement = async (req, res ) =>{
    try{
        const {iban, bic, titulaire_compte, nom_banque, devise} = req.body ;
        const commerce_ = await Commerce.getCommerceInfo(req.session.user.id_utilisateur);
        await CommercePayment.updateInfoCarteCommercant(iban, bic, titulaire_compte, nom_banque, devise,commerce_.id_commerce)
        req.flash('success', 'Les informations de paiement ont été mises à jour avec succès.');
        return res.redirect('/commercant-profil');
    } catch(err){
        console.log('error', 'Une erreur est survenue lors de la mise à jour');
        req.flash('error', 'Une erreur est survenue lors de la mise à jour des informations bancaires.');
        return res.redirect('/commercant-profil');
    }
}
