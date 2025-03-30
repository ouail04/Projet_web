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