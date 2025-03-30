exports.showCommercantIndexPage = async (req, res) => {
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Commandes", lien : "/commercant-commandes"},
        {titre : "Contact", lien : "#contact"}];

    const listCommandes = [1, 2, 3, 4, 5, 6]; 
    css_files = ["index-commercant.css"] ;


    res.render('commercant/index-commercant', {
        titre: 'Acceuil',
        pages,
        css_files,
        listCommandes
    });
};