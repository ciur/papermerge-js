import $ from "jquery";

// extend dropdown with multilevel menus
// https://stackoverflow.com/questions/44467377/bootstrap-4-multilevel-dropdown-inside-navigation
export function dropdown_multilevel() {
    $('.dropdown-menu a.dropdown-toggle').on('click', function(e) {
        if (!$(this).next().hasClass('show')) {
            $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');


        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function(e) {
            $('.dropdown-submenu .show').removeClass("show");
    });

    return false;
});
}