const telechargerImage = require('./gestionImages');
const deleteImage = require('./delete-image')
const Offre = require('../models/offre');
const offre = require('../models/offre');


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
    css_files = ["mes-offres.css"] ;
    try{
        const listOffres = await Offre.getOffresByID(1) ;
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
    let { nom_offre, type, sort_by, statut } = req.query;
    if(nom_offre == undefined) nom_offre = " " ;
    console.log("nom_offre : ", nom_offre, " type : ", type, " sort_by : ", sort_by, " statut : ", statut) ;
    const listOffres = await Offre.searchOffer(nom_offre, type, sort_by, statut) ;
    const pages = [
        {titre : "Accueil", lien : "/Commercant"},
        {titre : "Mes offres", lien : "/mes-offres"},
        {titre : "Commandes", lien : "/commercant-commandes"},
        {titre : "Contact", lien : "#contact"}];
    css_files = ["mes-offres.css"] ;
    res.render('commercant/mes-offres', {
        titre: 'Mes offres',
        pages,
        css_files,
        listOffres, nom_offre, type, sort_by, statut
    });
}

