const telechargerImage = require('./gestionImages');
const deleteImage = require('./delete-image')
const Offre = require('../models/offre');
const Commande = require('../models/Commande') ;
const utilisateur = require('../models/Utilisateur');
const Commerce = require('../models/Commerce');
const CommercePayment = require('../models/CommercePayment');
const { decrypt_data } = require('./security');



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
            statut : "all"
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
        listCommandesterminier
    });
};


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
    let carte_commerce = await CommercePayment.getCommercePaymentByID(req.session.user.id_utilisateur);
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
        resultat
    });
};

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
            const id_commerce = req.session.user?.id_commerce;
            Offre.addNewOffre({id_commerce, nom_offre, type, prix_avant, prix_apres, date_expiration, 
                disponibilite, description, condition, statut, imageURL,disponibilite  }) ;
            console.error('Offre ajouter avec succees');
            return res.redirect('/mes-offres');
        } catch (error) {
            console.log('Erreur:', error);
            return res.redirect('/mes-offres');
        }
    }
];

exports.editOffer = [telechargerImage, async (req, res) => {
    try {
        // Correction des noms de paramètres
        const {id_offre, nom_offre, type, prix_avant, prix_apres, date_expiration, 
              disponibilite, description, condition, statut} = req.body;

        let image_url = null;
        if (req.file) {
            // Chemin absolu et vérification
            image_url = '/static/upload/' + req.file.filename;
            console.log('Nouvelle image:', image_url);
            try {
                const image_url_delete = await offre.getImageUrl(id_offre) ;
                await deleteImage(image_url_delete.offre_URL);
                console.log("suppression avec succes")  ;
            } catch (error) {
                console.log("erreur de suppression : " , error) ;
                return res.redirect('/mes-offres') ;
            }
        }

        await Offre.updateOffer({
            id_offre, 
            nom_offre, // Nom corrigé
            type, 
            prix_avant, 
            prix_apres, // Nom corrigé
            date_expiration, 
            disponibilite, 
            description, 
            condition, 
            statut,
            imageURL: image_url
        });
        return res.redirect('/mes-offres');
    } catch(err) {
        console.error('Erreur:', err);
        return res.redirect('/mes-offres');
    }
}];


exports.deleteOffer = async (req, res) => {
    try {
        const { id_offre } = req.body;
        const image_url_delete = await offre.getImageUrl(id_offre) ;
        await deleteImage(image_url_delete.offre_URL);
        await Offre.deleteOffre(id_offre) ;
        return res.redirect('/mes-offres');
    } catch(err) {
        console.error('Erreur:', err);
        return res.redirect('/mes-offres');
    }
};


exports.setStatus = async (req, res) => {
    try {
        const { id_offre, statut } = req.body;
        await Offre.setStatus(id_offre, statut) ;
        return res.redirect('/mes-offres');
    } catch(err) {
        console.error('Erreur:', err);
        return res.redirect('/mes-offres');
    }
}


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


exports.validerCommande = async (req, res) => {
    const {id_commande, code_validation} = req.body ;
    const commande = await Commande.getCommandeByID(id_commande) ;
    if (code_validation  == commande.code_validation){
        await Commande.updateStatusCommande(id_commande, 'validée') ;
        console.log('commande valider avec succes') ;
        return res.redirect('/commercant-commandes');
    } else {
        console.log('commande non valider code validation incorrect ');
        return res.redirect('/commercant-commandes') ;
    }
}


exports.updateCommercantProfil = async (req, res) => {
    try {
        // 1. Validation des données
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
            console.log('success', 'Profil mis à jour avec succès');
        } else {
            console.log('info', 'Aucune modification effectuée');
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


exports.updateCommercePaiement = async (req, res ) =>{
    try{
        const {iban, bic, titulaire_compte, nom_banque, devise} = req.body ;
        const commerce_ = await Commerce.getCommerceInfo(req.session.user.id_utilisateur);
        await CommercePayment.updateInfoCarteCommercant(iban, bic, titulaire_compte, nom_banque, devise,commerce_.id_commerce)
        return res.redirect('/commercant-profil');
    } catch(err){
        console.log('error', 'Une erreur est survenue lors de la mise à jour');
        return res.redirect('/commercant-profil');
    }
}
