import {dglReady} from "./utils";

import {add_zoom_2_document_form} from "./document_form";
import {add_switch_2_document_form} from "./document_form";
import {add_load_on_scroll} from "./document_form";

import {DgPageScroll} from "./document_form/page_scroll";

import {sort_cookie} from "./sort_cookie";
import {BrowseView} from "./views/browse";
import {BreadcrumbView} from "./views/breadcrumb";
import {ActionsView} from "./views/actions";
import {BrowseRouter} from "./routers/browse";
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
  let browse_view,
    actions_view,
    breadcrumb_view,
    browse_router;

  let dom_actual_pages = document.querySelector('.actual-pages');

  on_document_form(add_zoom_2_document_form);
  on_document_form(add_switch_2_document_form);

  // creates a new DgDocument instance
  on_document_form(add_load_on_scroll);

  if (dom_actual_pages) {
      new DgPageScroll(dom_actual_pages);
  }
  
  browse_view = new BrowseView();
  actions_view = new ActionsView();
  breadcrumb_view = new BreadcrumbView();
  browse_router = new BrowseRouter(
    browse_view,
    breadcrumb_view
  );
  Backbone.history.start();
  
  sort_cookie();
};

dglReady( // i.e. after all DOM is loaded
  function(event) {
      App();
  }
);
