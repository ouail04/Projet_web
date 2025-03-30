//const OfferModel = require('../models/OfferModel');

exports.showHomePage = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/"},
        {titre : "Offres", lien : "/offres"},
        {titre : "Comment ça marche ?", lien : "/#comment-ca-marche"},
        {titre : "Contact", lien : "#contact"}];
    const latestOffers = [1, 2, 3, 4, 5, 6]; 
    const avis = [1,2,3] ;
    css_files = ["offres-section-index.css", "hero-section.css", "comment-ca-marche.css","avis-index.css"] ;


    res.render('anonyme/index', {
        titre: 'Accueil',
        pages,
        css_files,
        offers: latestOffers,
        avis
    });
};

exports.showOffersPage = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/"},
        {titre : "Offres", lien : "/offres"},
        {titre : "Comment ça marche ?", lien : "/#comment-ca-marche"},
        {titre : "Contact", lien : "#contact"}];

    const offres = [1, 2, 3, 4, 5, 6]; 
    const css_files = ["filtre-section-offres.css", "offres.css"] ;
    const nb_pages = 3 ;
    const current_page = 1 ;
    
    res.render('anonyme/offres', {
        titre: 'Offres',
        pages,
        css_files,
        offers: offres,
        nb_pages,
        current_page
    });
};

exports.showHowItWorksSection = async (req, res) => {
    res.redirect('/#comment-ca-marche');  // Redirige vers la page d'accueil avec l'ancre
};