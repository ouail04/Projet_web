exports.showCommercantIndexPage = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Commandes", lien : "/commercant-commandes"},
        {titre : "Contact", lien : "#contact"}];

    const listCommandes = [1, 2, 3, 4, 5, 6]; 
    css_files = ["index-commercant.css"] ;


    res.render('commercant/index-commercant', {
        titre: 'Accueil',
        pages,
        css_files,
        listCommandes
    });
};

exports.showCommercantOffres = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Commandes", lien : "/commercant-commandes"},
        {titre : "Contact", lien : "#contact"}];

    const listOffres = [1, 2, 3, 4, 5, 6]; 
    css_files = ["mes-offres.css"] ;


    res.render('commercant/mes-offres', {
        titre: 'Mes offres',
        pages,
        css_files,
        listOffres
    });
};

exports.showCommercantCommandes = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Mes commandes", lien : "/commercant-commandes"},
        {titre : "Contact", lien : "#contact"}];

    const listCommandes = [1, 2, 3, 4, 5, 6]; 
    css_files = ["commandes.css"] ;


    res.render('commercant/commercant-commandes', {
        titre: 'Mes commandes',
        pages,
        css_files,
        listCommandes
    });
};


exports.showCommercantProfil = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Mes commandes", lien : "/commercant-commandes"},
        {titre : "Contact", lien : "#contact"}];

    const listCommandes = [1, 2, 3, 4, 5, 6];
    const avis = [1,2,3,4,5] ;
    css_files = ["profil.css"] ;


    res.render('commercant/commercant-profil', {
        titre: 'Profil Commerçant',
        pages,
        css_files,
        list_avis:avis
    });
};