import $ from "jquery";
import {get_parent_id} from "./utils";
import {DgSelection} from "./selection";

export function show_add_new_folder(new_folder_sel) {
  $(new_folder_sel).click(function(e){
      var target_id = $(this).data("target-id"),
          $target; // target is new folder form displayed to user

      e.preventDefault();

      $target = $("#" + target_id);
      if ($target.length == 0) {
          console.log("target " + target_id + " not found");
          return;
      }
      $("#modals-container").css("display", "flex");

      $target.find("[name='parent_id']").attr("value", get_parent_id());
      $target.find("[name='title']").val("");
      
      $target.show();

      $target.find(".cancel").click(function(e){ 
        e.preventDefault();
        $("#modals-container").hide();
        $target.hide();
      });
  });
}

export function node_doubleclick(node_sel) {
  $(node_sel).dblclick(function(){
      let $anchor = $(this).find("a");

      if ($anchor.length > 0) {
        $anchor[0].click();
      }
  });
}

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

export function shorten_title() {

  function shorten(selector, len) {
    
    $(selector).each(function() {
      let anchor = $(this).find("a");
      let text = anchor.text(), result;

      if (text && text.length > len) {
        result = text.substring(0, len);
        anchor.text(`${result}...`); 
      }
    });

    
  }
  //for node's title in list mode
  shorten(".shorten36", 36);
  //for node's title in grid mode
  shorten(".shorten16", 16);
}