"use strict"
function showEditForm() {
    document.getElementById('currentBankInfo').style.display = 'none';
    document.getElementById('editBankForm').style.display = 'block';
    }

function cancelEdit() {
    document.getElementById('editBankForm').style.display = 'none';
    document.getElementById('currentBankInfo').style.display = 'block';
    document.getElementById('bankForm').reset();
}

function setEditOfferData(offre) {
    console.log(offre);
    document.getElementById('id_offre_modifier').value = offre.id_offre;
    
    document.getElementById('nom_offre_modifier').value = offre.nom_offre;
    document.getElementById('type_modifier').value = offre.type;
    document.getElementById('prix_apres_modifier').value = offre.prix_apres;
    document.getElementById('prix_avant_modifier').value = offre.prix_avant;
    document.getElementById('disponibilite_modifier').value = offre.disponibilite;
    document.getElementById('description_modifier').value = offre.description;
    document.getElementById('date_expiration_modifier').value = offre.date_expiration ;
    document.getElementById('preview_modifier').src = offre.offre_URL ;
    document.getElementById('condition_modifier').value = offre.condition || "";
    if (offre.statut === "paused") {
        document.getElementById('offerPaused_modifier').checked = true;
    } else {
        document.getElementById('offerActive_modifier').checked = true;
    }
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            document.getElementById('preview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
            // Stocker l'image en base64 temporairement ou l'uploader via AJAX
            document.getElementById('offre_URL').value = e.target.result;
        }

        
        reader.readAsDataURL(input.files[0]);
    }
}


function previewImage_modifier(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            document.getElementById('preview_modifier').src = e.target.result;
            document.getElementById('imagePreview_modifier').style.display = 'block';
            // Stocker l'image en base64 temporairement ou l'uploader via AJAX
            document.getElementById('offre_URL_modifier').value = e.target.result;
        }

        
        reader.readAsDataURL(input.files[0]);
    }
}