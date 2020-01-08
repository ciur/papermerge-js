import {dglReady} from "./utils";
import {DgUploader} from "./uploader/uploader";
import {dropdown_multilevel} from "./dropdown";
import {show_add_new_folder, node_doubleclick, shorten_title} from "./changelist";
import {document_preloader} from "./changelist";

import {add_zoom_2_document_form} from "./document_form";
import {add_switch_2_document_form} from "./document_form";
import {add_load_on_scroll} from "./document_form";

import {registration} from "./register";
import {decorate_passwords} from "./password";
import {build_changelist_actions} from "./actions/changelist_actions";
import {build_changeform_actions} from "./actions/changeform_actions";
import {DgPageScroll} from "./document_form/page_scroll";

import {TopRightMenu} from "./top_right_menu";
import {LeftMenu} from "./side_menu/left";
import {RightMenu} from "./side_menu/right";

import $ from "jquery";

import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/toast';

let on_document_form = function(func) {
  let $document_form = $("#document_form");

  if ($document_form.length == 0) {
      return;
  }

  func();
}


let App = function() {
  let  upload_feedback_sw = $('upload-feedback-switch'),
      uploader = new DgUploader(),
      top_right_menu = new TopRightMenu(
        "#top-right-menu-wrapper",
        "#top-right-menu",
        ".top-right-menu-trigger"
      ),
      left_menu = new LeftMenu(
        "#left-sidebar.phone",
        "#top-left-logo  .icon-hamburger"
      ),
      right_menu = new RightMenu(
        "#document_details",
        "#top-right-menu-wrapper .icon-3dots"
      )
    ;

  let dropdown = dropdown_multilevel();
  let dom_actual_pages = document.querySelector('.actual-pages');

  // submits a form to the server to create a new folder
  show_add_new_folder("button#new-folder");

  on_document_form(add_zoom_2_document_form);
  on_document_form(add_switch_2_document_form);
  on_document_form(add_load_on_scroll);
  //$('.toast').toast({'autohide': true, 'delay': 5000});
  $('.toast').toast({'autohide': false});
  $('.toast').toast('show');

  if ($("#register-form").length > 0) {
    registration();
  } else {
    decorate_passwords();
  }

  if (dom_actual_pages) {
      new DgPageScroll(dom_actual_pages);
  }
  

  build_changelist_actions();
  build_changeform_actions();
  node_doubleclick(".dblclick");
  // make node's titles (in document's changelist grid/list mode)
  shorten_title();
  
  document_preloader();
};

dglReady( // i.e. after all DOM is loaded
  function(event) {
      App();
  }
);
