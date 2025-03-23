"use strict";
document.addEventListener("DOMContentLoaded" , DCL_calback) ;
// Affichage du section de panier
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');

function DCL_calback(event){
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    });

    cartOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });
}