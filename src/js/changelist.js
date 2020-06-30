import $ from "jquery";

export function document_preloader() {

  // displays a gray area (gray bg color) and a spinner
  // for loading images.
  // When ALL IMAGES are loaded window receives an "load" even:
  // spinner is removed and gray area changes into image preview.
  $(window).on("load", function() {
    $(".zero_pix").removeClass("zero_pix");
    $(".document-loading").hide();
  });
}
