const offre = require('../models/offre');
const Commande = require('../models/Commande');
const Commande_Offre = require('../models/Commande_Offre');
const client_payment = require('../models/client_payment');
const PaiementStripe = require('./payment_stripe');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcrypt');
const {encrypt_data, decrypt_data} = require('./security') ;


const CommercePayment = require('../models/CommercePayment');
const utilisateur = require('../models/Utilisateur');
const e = require('express');


// cette fonction permet d'afficher la page des commandes deja faites par le client
exports.showCommandesPage = async (req, res) => {
    if(!req.session.user){
        return res.redirect('/') ;
    }

    try{
        const pages = [
            {titre : "Accueil", lien : "/"},
            {titre : "Offres", lien : "/offres"},
            {titre : "Commandes", lien : "/commandes"},
            {titre : "Profil", lien : "/profil"},
            {titre : "Contact", lien : "#contact"}];

        css_files = ["client/panier.css", "client/filtre-section-commande.css"] ;
        const panier = await Commande.getPanierByID(req.session.user.id_utilisateur);
        const listCommandes = await Commande.getCommandesByIDClient(req.session.user.id_utilisateur);
        let id_commande ;
        panier.length > 0 ? id_commande = panier[0].id_commande : id_commande = null ;

            
        res.render('client/commandes-client', {
            titre: 'Commandes',
            pages,
            css_files,
            listCommandes,
            panier,
            id_commande,
            listCommandes,
            search : '',
            status : 'default',
            dateSort : 'recent'
        });
    } catch (error) {
        console.error("Erreur lors de l'affichage des commandes:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de l'affichage des commandes." });
    }
};


// cette fonction permet d'afficher la page de profil du client
// elle affiche aussi la liste des cartes de paiement du client
exports.showProfilPage = async (req, res) => {
    if(!req.session.user){
        return res.redirect('/') ;
    }
    const pages = [
        {titre : "Accueil", lien : "/"},
        {titre : "Offres", lien : "/offres"},
        {titre : "Commandes", lien : "/commandes"},
        {titre : "Profil", lien : "/profil"},
        {titre : "Contact", lien : "#contact"}];
        const user = await utilisateur.getutilisateurByID(req.session.user.id_utilisateur) ;
        const encryptedCards = await client_payment.getClientPaymentByID(req.session.user.id_utilisateur)
        const cards = encryptedCards.map(card => {
            // Décryptage partiel (uniquement les 4 derniers chiffres)
            const fullNumber = decrypt_data(card.numero_carte_client);
            return {
                ...card,
                last4: fullNumber.slice(-4), // Extraction des 4 derniers
                displayNumber: `•••• •••• •••• ${fullNumber.slice(-4)}`
            };
        });
        const panier = await Commande.getPanierByID(req.session.user.id_utilisateur);
        let id_commande ;
        panier.length > 0 ? id_commande = panier[0].id_commande : id_commande = null ;
        
    css_files = ["client/panier.css", "client/information-personnelle.css"] ;
    res.render('client/client-profil', {
        titre: 'Profil Client',
        pages,
        css_files,
        panier,
        id_commande,
        cards,
        user,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }

    });
};

// cette fonction permet de faire une recherche d'offres
// elle est appelée lors de la soumission du formulaire de recherche sur la page des offres
// elle redirige vers la page des offres avec les résultats de la recherche
exports.searchOfferClient = async (req, res) => {
    let { nom_offre, type, sorted_experation = 'all', sorted_prix, ville } = req.query;
    type  == '' ? type = 'all' : type = type ;
    sorted_experation == '' ? sorted_experation = 'all' : sorted_experation = sorted_experation ;
    console.log('Paramètres de recherche:', { nom_offre, type, sorted_experation, sorted_prix, ville });
    let session ;
    const pages = [
        { titre: "Accueil", lien: "/" },
        { titre: "Offres", lien: "/offres" },
        { titre: "Commandes", lien: "/commandes" },
        {titre : "Profil", lien : "/profil"},
        { titre: "Contact", lien: "#contact" }
    ];
    
    const css_files = [
        "anonyme/panier.css", 
        "anonyme/filtre-section-offres.css", 
        "anonyme/offres-section-index.css", 
        "anonyme/offres.css"
    ];
    
    try {
        const offers = await offre.searchOfferClient(nom_offre, type, sorted_experation, sorted_prix, ville);
        if(req.session.user){
            const panier = await Commande.getPanierByID(req.session.user.id_utilisateur);
            session = req.session.user ;
        } else {
            panier = [] ;
            session = null ;
        }
     
        let id_commande ;
        panier.length > 0 ? id_commande = panier[0].id_commande : id_commande = null ;
        res.render('anonyme/offres', {
            titre: 'Offres',
            pages: pages,
            css_files: css_files,
            offers: offers,
            session : session,
            nom_offre, type, sorted_experation, sorted_prix, ville, panier, id_commande, 
        });
    } catch (error) {
        console.error("Erreur lors de la recherche d'offres:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de la recherche." });
    }
};

// cette fonction permet d'afficher la page de détails d'une offre
exports.showDetailsOffer = async (req, res) => {
    if(!req.session.user){
        return res.redirect('/login') ;
    }
    const id_offre = req.params.id; 
    try {
        const pages = [
            {titre : "Accueil", lien : "/"},
            {titre : "Offres", lien : "/offres"},
            {titre : "Commandes", lien : "/commandes"},
            {titre : "Profil", lien : "/profil"},
            {titre : "Contact", lien : "#contact"}];
        const css_files = ["commande-client.css", "client/panier.css", "client/header-client.css"] ;
        const panier = await Commande.getPanierByID(req.session.user.id_utilisateur);
        const offreDetails = await offre.getOffreByID(id_offre);
        const offresSimilaires = await offre.searchOfferClient('' , offreDetails.type , 'all' ,'all' , '' , 3); 
        let id_commande ;
        panier.length > 0 ? id_commande = panier[0].id_commande : id_commande = null ;
        res.render('client/details-offre', {
            titre: 'Détails de l\'offre',
            pages,
            css_files,
            id_offre,
            offreDetails,
            offresSimilaires,
            panier,
            id_commande,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error("Erreur lors de la recherche d'offres:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de la recherche." });
    }
};


// cette fonction permet d'ajouter une offre au panier du client
// elle est appelée lors de la soumission du formulaire d'ajout au panier sur la page de détails de l'offre
exports.addToPanier = async (req, res) => {
    try{
        const id_offre = req.query.id_offre;
        const quantite = req.query.quantity;
        const offre_ = await offre.getOffreByIdOffre(id_offre);
        const nouvelle_dispo = offre_.disponibilite_actuelle - quantite ;
        if (nouvelle_dispo >= 0){
            const commande_attente = await Commande.getIdCommandeEnAttente(req.session.user.id_utilisateur);
            let prix_totale = quantite * offre_.prix_apres;
            let id_commande;
            if (commande_attente == null) {
                id_commande = await Commande.addCommande(req.session.user.id_utilisateur, prix_totale);
            }
            else {
                id_commande = commande_attente.id_commande;
                prix_totale = commande_attente.prix_totale + (offre_.prix_apres * quantite);
                await Commande.updatePrix(id_commande, prix_totale);
            }
            const id_commande_offres = await Commande_Offre.addCommande_Offre(id_commande, id_offre, quantite);
            await offre.updateDiponibilite(nouvelle_dispo, id_offre);
            req.flash('success', 'Offre ajoutée au panier avec succès.');
            return res.redirect('/details-offre/' + id_offre);
        } else{
            req.flash('error', 'Quantité non disponible.');
            return res.redirect('/details-offre/' + id_offre);
        }
        

    } catch (error) {
        req.flash('error', 'Erreur lors de l\'ajout au panier.');
        console.error("Erreur lors de l'ajout au panier:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de l'ajout au panier." });
    }
}

// cette fonction permet de supprimer une offre du panier du client
// elle est appelée lors de la soumission du formulaire de suppression sur la page du panier
// elle ajoute aussi la quantité de l'offre supprimée à la disponibilité de l'offre
// et met à jour le prix total de la commande
exports.deleteOfferPanier = async (req, res) => {
    try {
        const id_commande_offre = req.params.id;
        const commande_offre = await Commande_Offre.getCommande_OffreByID(id_commande_offre);
        const offre_ = await offre.getOffreByID(commande_offre.id_offre);
        const commande_attente = await Commande.getIdCommandeEnAttente(req.session.user.id_utilisateur);
        await Commande_Offre.deleteOfferPanier(id_commande_offre);
        const prix_totale = commande_attente.prix_totale - (offre_.prix_apres * commande_offre.quantite);
        await Commande.updatePrix(commande_attente.id_commande, prix_totale);
        await offre.updateDiponibilite(commande_offre.quantite + offre_.disponibilite_actuelle, offre_.id_offre) ;
        req.flash('success', 'Offre supprimée du panier avec succès.');
        return res.redirect('/offres');
    } catch (error) {
        req.flash('error', 'Erreur lors de la suppression de l\'offre du panier.');
        console.error("Erreur lors de la suppression de l'offre du panier:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de la suppression de l'offre." });
    }
}

// cette fonction permet d'afficher la page de paiement
exports.showPaymentPage = async (req, res) => {
    if(!req.session.user){
        return res.redirect('/') ;
    }
    try{
        const pages = [
            {titre : "Accueil", lien : "/"},
            {titre : "Offres", lien : "/offres"},
            {titre : "Commandes", lien : "/commandes"},
            {titre : "Contact", lien : "#contact"}];
        const id_commande = req.params.id;
        if(!id_commande){
            req.flash('error', 'Une commande est nécessaire pour accéder à cette page.');
            return res.redirect('/offres') ;
        }
        const commande = await Commande.getCommandeByID(id_commande);
        const panier = await Commande.getPanierByID(req.session.user.id_utilisateur);
        const carte_payment = await client_payment.getClientPaymentByID(req.session.user.id_utilisateur);
        const css_files = ["client/panier.css", "client/commande-client.css", "client/header-client.css"] ;
        res.render('client/payment', {
            titre: 'Paiement',
            pages,
            css_files,
            panier,
            commande,
            carte_payment
        });
    } catch (error) {
        console.error("Erreur lors de l'affichage de la page de paiement:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de l'affichage de la page de paiement." });
    }
};

// cette fonction permet de traiter le paiement
exports.processPayment = async (req, res) => {
    const { id_commande, id_client, savedCard, save_card, numero_carte, date_expiration, CVC, titulaire_carte, type_carte } = req.body;
    const commande  = await Commande.getCommandeByID(id_commande);
    const list_commande_offre = await Commande_Offre.getCommande_OffreByIDCommande(id_commande);
    const offre_ = await offre.getOffreByIdOffre(list_commande_offre[0].id_offre);
    const banque_commerce = await CommercePayment.getCommercePaymentByID(offre_.id_commerce);
    const prix_totale = commande.prix_totale;
    // si savedCard est cocher, on utilise la carte enregistrée
    if (savedCard){
        // on utilise l'API de stripe pour faire le paiement
        const resultat = await PaiementStripe.paiementStripe(prix_totale * 100, 'eur');
        if (resultat.success || prix_totale==0) {
            console.log("1Paiement réussi avec la carte enregistrée :", resultat.clientSecret);
            // on ajoute la transaction dans la base de données
            await Transaction.addTransaction(banque_commerce.id_commerce_payment, savedCard, prix_totale);
            // on fait la mise à jour de la commande de 'en attente' à 'en cours'
            await Commande.updateStatusCommande(id_commande, 'en cours');
            req.flash('success', 'Paiement effectué avec succès.');
            return res.redirect('/offres');
        } else{
            console.error("Erreur de paiement :", resultat.error);
            return res.status(500).render('erreur', { message: "Une erreur est survenue lors du paiement." });
        }
        // s'il a choisi de sauvegarder la carte, on l'ajoute à la base de données
    } else if(save_card && numero_carte && date_expiration && CVC && titulaire_carte) {
        const resultat = await PaiementStripe.paiementStripe(prix_totale * 100, 'eur');
        if (resultat.success || prix_totale==0) {
            console.log("2Paiement réussi avec la nouvelle carte :", resultat.clientSecret);
            const id_client_payment = await client_payment.addClientPayment(numero_carte, date_expiration, CVC, titulaire_carte, type_carte, id_client);
            await Transaction.addTransaction(banque_commerce.id_commerce_payment,id_client_payment, prix_totale);
            await Commande.updateStatusCommande(id_commande, 'en cours');
            req.flash('success', 'Paiement effectué avec succès.');
            return res.redirect('/offres');
        } else {
            console.error("Erreur de paiement :", resultat.error);
            return res.status(500).render('erreur', { message: "Une erreur est survenue lors du paiement." });
        }
        // s'il n'a pas choisi de sauvegarder la carte, on fait le paiement avec la nouvelle carte
    } else if (numero_carte && date_expiration && CVC && titulaire_carte) {
        const resultat = await PaiementStripe.paiementStripe(prix_totale * 100, 'eur');
        if (resultat.success || prix_totale == 0) {
            console.log("3Paiement réussi avec la nouvelle carte :", resultat.clientSecret);
            // on ajoute la carte à la base de données meme si le client à pas choisi de la sauvegarder
            // car on a besion de souvgarder la carte pour faire la transaction
            const id_client_payment = await client_payment.addClientPayment(numero_carte, date_expiration, CVC, titulaire_carte, type_carte, id_client);
            await Transaction.addTransaction(banque_commerce.id_commerce_payment, id_client_payment, prix_totale);
            await Commande.updateStatusCommande(id_commande, 'en cours');
            req.flash('success', 'Paiement effectué avec succès.');
            return res.redirect('/offres');
        } else {
            console.error("Erreur de paiement :", resultat.error);
            return res.status(500).render('erreur', { message: "Une erreur est survenue lors du paiement." });
        }
    } 
    console.error("Aucune méthode de paiement valide fournie.");

    return res.redirect('/payment/' + req.body.id_commande) ;
}


// cette fonction permet de faire une recherche de commandes
exports.searchCommandeClient = async (req, res) =>{
    if(!req.session.user){
        return res.redirect('/') ;
    }
    const {search , status, dateSort} = req.query ;
    console.log ("donneés : ", req.query) ;
    try{
        const pages = [
            {titre : "Accueil", lien : "/"},
            {titre : "Offres", lien : "/offres"},
            {titre : "Commandes", lien : "/commandes"},
            {titre : "Contact", lien : "#contact"}];

        css_files = ["client/panier.css", "client/filtre-section-commande.css"] ;
        const listCommandes = await Commande.searchCommandesClient(req.session.user.id_utilisateur, search, status, dateSort);
        const panier = await Commande.getPanierByID(req.session.user.id_utilisateur);
        let id_commande ;
        panier.length > 0 ? id_commande = panier[0].id_commande : id_commande = null ;

        console.log('list commande : ', listCommandes);
        res.render('client/commandes-client', {
            titre: 'Commandes',
            pages,
            css_files,
            listCommandes,
            panier,
            id_commande,
            listCommandes,
            search : search ,
            status : status,
            dateSort: dateSort
        });
    } catch (error) {
        console.error("Erreur lors de l'affichage des commandes:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de l'affichage des commandes." });
    }
}

// cette fonction permet de faire la mise à jour du profil du client
// seulment les champs adresse, nom, prenom, telephone et email peuvent être mis à jour
exports.updateProfil = async (req, res) => {
    try {
        const { adresse, nom, prenom, telephone, email } = req.body;

        await utilisateur.updateUtilisateur(
            req.session.user.id_utilisateur,
            adresse,
            nom,
            prenom,
            telephone,
            email
        );

        req.flash('success', 'Profil mis à jour avec succès.');

        if (req.session.user.type_utilisateur === 'client') {
            return res.redirect('/profil');
        } else {
            return res.redirect('/commercant-profil');
        }

    } catch (err) {
        console.error('Erreur lors de la mise à jour du profil :', err);
        req.flash('error', 'Une erreur est survenue lors de la mise à jour du profil.');

        if (req.session.user.type_utilisateur === 'client') {
            return res.redirect('/profil');
        } else {
            return res.redirect('/commercant-profil');
        }
    }
};


// cette fonction permet de faire la mise à jour du mot de passe du client et de commercant
exports.updatePasword = async(req, res) =>{
    const {currentPassword, newPassword} = req.body ;
    
    const client = await utilisateur.getutilisateurByID(req.session.user.id_utilisateur);

    const isEgaux = await bcrypt.compare(currentPassword, client.mot_de_passe);
    if(!isEgaux){
        req.flash('error', 'Ancien mot de passe incorrect.');
        if(req.session.user.type_utilisateur == 'client'){
            return res.redirect('profil');
        } else{
            return res.redirect('commercant-profil');
        }
    } else{
        await utilisateur.updatePassword(req.session.user.id_utilisateur,newPassword ) ;
        return res.redirect('/logout') ;
    }                     
}


// cette fonction permet d'ajouter une carte de paiement à partir de la page de profil
exports.addCartePayment = async (req, res) =>{
    try{
        const {titulaire_carte, numero_carte_client, date_expiration, cvv, carte_type} = req.body ;
        await client_payment.addClientPayment(numero_carte_client, date_expiration, cvv, titulaire_carte, carte_type, req.session.user.id_utilisateur)
        req.flash('success', 'Carte de paiement ajoutée avec succès.');
        return res.redirect('/profil') ;
    } catch(err){
        req.flash('error', 'Erreur lors de l\'ajout de la carte de paiement.');
        console.log('erreur lors de l ajout de carte de paiement : ',err  );
        return res.redirect('/profil') ;
    }
}

// cette fonction permet de supprimer une carte de paiement à partir de la page de profil
exports.deleteCartePaiement = async (req, res) =>{
   try{
        const id_client_payment = req.params.id ;
        await client_payment.deleteCartePaiement(id_client_payment);
        req.flash('success', 'Carte de paiement supprimée avec succès.');
        return res.redirect('/profil') ;
   } catch(err){
        req.flash('error', 'Erreur lors de la suppression de la carte de paiement.');
        console.log('erreur lors de la suppression de carte de paiement : ',err  );
        return res.redirect('/profil') ;
   }
}
