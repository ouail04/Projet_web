const session = require('express-session');
const offre = require('../models/offre');

exports.showHomePage = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/"},
        {titre : "Offres", lien : "/offres"},
        {titre : "Comment ça marche ?", lien : "/#comment-ca-marche"},
        {titre : "Contact", lien : "#contact"}];

    try{
        const offres = await offre.searchOfferClient('', 'all', 'all', 'all', '', true) ; 
        const css_files = [
            "anonyme/avis-index.css", 
            "anonyme/comment-ca-marche.css", 
            "anonyme/header-anonyme.css", 
            "anonyme/hero-section.css",
            "anonyme/offres-section-index.css"
        ];
        res.render('anonyme/index', {
            titre: 'Accueil',
            pages,
            css_files,
            offers: offres,
            avis: [1,2,3],
            session: req.session
        });
    }
    catch (error) {
        console.error("Erreur lors de la recherche d'offres:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de la recherche." });
    }
};

exports.showOffersPage = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/"},
        {titre : "Offres", lien : "/offres"},
        {titre : "Comment ça marche ?", lien : "/#comment-ca-marche"},
        {titre : "Contact", lien : "#contact"}];

    try{
        const offres = await offre.searchOfferClient('', 'all', 'all', 'all', '') ; 
        const css_files = [
            "anonyme/panier.css", 
            "anonyme/filtre-section-offres.css", 
            "anonyme/offres-section-index.css", 
            "anonyme/offres.css"
        ];
        const nb_pages = 3 ;
        const current_page = 1 ;
        const avis = [1,2,3] ;
        res.render('anonyme/offres', {
            titre: 'Offres',
            pages,
            css_files,
            offers: offres,
            nb_pages,
            current_page, 
            nom_offre : '',
            type : 'all',
            sorted_experation : 'all',
            sorted_prix: 'all',
            ville : ''
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