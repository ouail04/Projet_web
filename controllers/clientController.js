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
        
    css_files = ["panier.css", "information-personnelle.css", "avis.css"] ;
    list_avis = [1,2,3,4,5,6,7,8] ;

    res.render('client/profil', {
        titre: 'Profil',
        pages,
        css_files,
        list_avis

    });
};
