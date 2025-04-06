const session = require('express-session');
const offre = require('../models/offre');
const Commande = require('../models/Commande');
const utilisateur = require('../models/Utilisateur');

exports.showHomePage = async (req, res) => {
    

        

    try{
        const offres = await offre.searchOfferClient('', 'all', 'all', 'all', '', 6) ; 
        const css_files = [
            "client/panier.css", 
            "anonyme/avis-index.css", 
            "anonyme/comment-ca-marche.css", 
            "anonyme/header-anonyme.css", 
            "anonyme/hero-section.css",
            "anonyme/offres-section-index.css"
        ];

        if (req.session.user){

            if (req.session.user.type_utilisateur == 'client'){
                const panier = await Commande.getPanierByID(req.session.user.id_utilisateur);
                let id_commande ;
                panier.length > 0 ? id_commande = panier[0].id_commande : id_commande = null ;
                const pages = [
                    {titre : "Accueil", lien : "/"},
                    {titre : "Offres", lien : "/offres"},
                    {titre : "Commandes", lien : "/commandes"},
                    {titre: "Profil", lien : "/profil"},
                    {titre : "Contact", lien : "#contact"}];
                res.render('anonyme/index', {
                    titre: 'Accueil',
                    pages,
                    css_files,
                    offers: offres,
                    session: req.session,
                    panier,
                    id_commande
                });
            } else{
                const user = await utilisateur.getutilisateurByID(req.session.user.id_utilisateur);

                const pages = [
                    {titre : "Accueil", lien : "/Commercant"},
                    {titre : "Mes offres", lien : "/mes-offres"},
                    {titre : "Commandes", lien : "/commercant-commandes"},
                    {titre : "Profil", lien : "/commercant-profil"},
                    {titre : "Contact", lien : "#contact"}];
                res.render('commercant/index-commercant', {
                    titre: 'Accueil',
                    pages,
                    css_files,
                    offers: offres,
                    session: req.session,
                    user
                });
            }
        } else{
            const pages = [
                {titre : "Accueil", lien : "/"},
                {titre : "Offres", lien : "/offres"},
                {titre : "Comment ça marche ?", lien : "/#comment-ca-marche"},
                {titre : "Contact", lien : "#contact"}];
                res.render('anonyme/index', {
                    titre: 'Accueil',
                    pages,
                    css_files,
                    offers: offres,
                    session : null
                });
        }
        
    }
    catch (error) {
        console.error("Erreur lors de la recherche d'offres:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de la recherche." });
    }
};

exports.showOffersPage = async (req, res) => {
    let session = null;
    let panier ;
    let id_commande ;
    let pages ;
    if (req.session.user){
        session = req.session ;
        panier = await Commande.getPanierByID(req.session.user.id_utilisateur);
        panier.length > 0 ? id_commande = panier[0].id_commande : id_commande = null ;
        pages = [
            {titre : "Accueil", lien : "/"},
            {titre : "Offres", lien : "/offres"},
            {titre : "Commandes", lien : "/commandes"},
            {titre : "Profil", lien : "/profil"},
            {titre : "Contact", lien : "#contact"}];
    }else{ 
        pages = [
        {titre : "Accueil", lien : "/"},
        {titre : "Offres", lien : "/offres"},
        {titre : "Comment ça marche ?", lien : "/#comment-ca-marche"},
        {titre : "Contact", lien : "#contact"}];
    }
    try{
        const offres = await offre.searchOfferClient('', 'all', 'all', 'all', '') ; 
        const css_files = [
            "client/panier.css", 
            "anonyme/filtre-section-offres.css", 
            "anonyme/offres-section-index.css", 
            "anonyme/offres.css"
        ];
        res.render('anonyme/offres', {
            titre: 'Offres',
            pages,
            css_files,
            offers: offres,
            nom_offre : '',
            type : 'all',
            sorted_experation : 'all',
            sorted_prix: 'all',
            ville : '',
            session,
            panier,
            id_commande
        });
    }
    catch (error) {
        console.error("Erreur lors de la recherche d'offres:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de la recherche." });
    }
};

exports.showHowItWorksSection = async (req, res) => {
    res.redirect('/#comment-ca-marche');  // Redirige vers la page d'accueil avec l'ancre
};