const offre = require('../models/offre');
exports.showCommandesPage = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/"},
        {titre : "Offres", lien : "/offres"},
        {titre : "Commandes", lien : "/commandes"},
        {titre : "Contact", lien : "#contact"}];

    const listCommandes = [1, 2, 3, 4, 5, 6]; 
    css_files = ["panier.css", "filtre-section-commande.css"] ;


    res.render('client/commandes-client', {
        titre: 'Commandes',
        pages,
        css_files,
        listCommandes
    });
};

exports.showProfilPage = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/"},
        {titre : "Offres", lien : "/offres"},
        {titre : "Commandes", lien : "/commandes"},
        {titre : "Contact", lien : "#contact"}];
        
    css_files = ["client/panier.css", "client/information-personnelle.css", "client/avis.css"] ;
    list_avis = [1,2,3,4,5,6,7,8] ;

    res.render('client/client-profil', {
        titre: 'Profil Client',
        pages,
        css_files,
        list_avis

    });
};


exports.searchOfferClient = async (req, res) => {
    let { nom_offre, type, sorted_experation = 'all', sorted_prix, ville } = req.query;
    type  == '' ? type = 'all' : type = type ;
    sorted_experation == '' ? sorted_experation = 'all' : sorted_experation = sorted_experation ;
    console.log('Paramètres de recherche:', { nom_offre, type, sorted_experation, sorted_prix, ville });

    const pages = [
        { titre: "Accueil", lien: "/" },
        { titre: "Offres", lien: "/offres" },
        { titre: "Commandes", lien: "/commandes" },
        { titre: "Contact", lien: "#contact" }
    ];
    
    const css_files = [
        "anonyme/panier.css", 
        "anonyme/filtre-section-offres.css", 
        "anonyme/offres-section-index.css", 
        "anonyme/offres.css"
    ];
    
    const nb_pages = 3;
    const current_page = 1;
    
    try {
        const offers = await offre.searchOfferClient(nom_offre, type, sorted_experation, sorted_prix, ville);
        
        res.render('anonyme/offres', {
            titre: 'Offres',
            pages: pages,
            css_files: css_files,
            offers: offers,
            nb_pages: nb_pages,
            current_page: current_page,
            nom_offre, type, sorted_experation, sorted_prix, ville
        });
    } catch (error) {
        console.error("Erreur lors de la recherche d'offres:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de la recherche." });
    }
};


exports.showDetailsOffer = async (req, res) => {
    const id_offre = req.params.id; 
    try {
        const pages = [
            {titre : "Accueil", lien : "/"},
            {titre : "Offres", lien : "/offres"},
            {titre : "Commandes", lien : "/commandes"},
            {titre : "Contact", lien : "#contact"}];
        const css_files = ["commande-client.css", "client/panier.css", "client/header-client.css", "anonyme/avis-index.css"] ;
        const avis = [1,2,3];

        const offreDetails = await offre.getOffreByID(id_offre); 
        res.render('client/details-offre', {
            titre: 'Détails de l\'offre',
            pages,
            css_files,
            avis,
            id_offre,
            offreDetails
        });
    } catch (error) {
        console.error("Erreur lors de la recherche d'offres:", error);
        res.status(500).render('erreur', { message: "Une erreur est survenue lors de la recherche." });
    }
};