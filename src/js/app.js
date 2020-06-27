import {dglReady} from "./utils";
import {DgUploader} from "./uploader/uploader";
import {show_add_new_folder, node_doubleclick, shorten_title} from "./changelist";
import {document_preloader} from "./changelist";

import {add_zoom_2_document_form} from "./document_form";
import {add_switch_2_document_form} from "./document_form";
import {add_load_on_scroll} from "./document_form";

import {registration} from "./register";
import {decorate_passwords} from "./password";
import {build_changelist_actions} from "./actions/changelist_actions";
import {DgPageScroll} from "./document_form/page_scroll";

import {sort_cookie} from "./sort_cookie";
import Backbone from 'backbone';

import $ from "jquery";

import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/toast';
import 'bootstrap/js/dist/tab';
import 'bootstrap/js/dist/modal';

let backboneSync = Backbone.sync;

Backbone.sync = function (method, model, options) {
    let csrf_token = $("[name=csrfmiddlewaretoken]").val();
    /*
     * The jQuery `ajax` method includes a 'headers' option
     * which lets you set any headers you like
     */
    options.headers = {
        'X-CSRFToken': csrf_token
    };
    /*
     * Call the stored original Backbone.sync method with
     * extra headers argument added
     */
    backboneSync(method, model, options);
};


let on_document_form = function(func) {
  let $document_form = $("#document_form");

  if ($document_form.length == 0) {
      return;
  }

  func();
}


let App = function() {
  let  uploader = new DgUploader();

  let dom_actual_pages = document.querySelector('.actual-pages');

  // submits a form to the server to create a new folder
  show_add_new_folder("button#new-folder");

  on_document_form(add_zoom_2_document_form);
  on_document_form(add_switch_2_document_form);
  // creates a new DgDocument instance
  on_document_form(add_load_on_scroll);
  //$('.toast').toast({'autohide': true, 'delay': 5000});
  //$('.toast').toast({'autohide': false});
  //$('.toast').toast('show');

  if (dom_actual_pages) {
      new DgPageScroll(dom_actual_pages);
  }
  
  build_changelist_actions();
  node_doubleclick(".dblclick");
  // make node's titles (in document's changelist grid/list mode)
  shorten_title();
  
  document_preloader();
  sort_cookie();
};

dglReady( // i.e. after all DOM is loaded
  function(event) {
      App();
  }
);
